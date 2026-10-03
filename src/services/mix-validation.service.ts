import { Ingredient } from '@prisma/client';
import { ChemistryService } from './chemistry.service';
import {
  BakeProcessStyle,
  FermentationProcessHints,
  runFermentationHeuristics
} from './fermentation-heuristics.service';
import { IngredientResolverService, NamedQuantity } from './ingredient-resolver.service';
import {
  computeStarterAdjustedMetrics,
  explicitOnlyHydration,
  StarterAdjustedMetrics
} from './dough-metrics.service';
import { convertToGrams } from './unit-conversion.service';
import {
  computeFlourRelativeRatios,
  runIntentRatioChecks
} from './intent-ratio-heuristics.service';
import {
  flourCupPackingChecks,
  SaltConversionRecord,
  saltVolumeChecks,
  VolumeConversionRecord
} from './volume-packing.service';
import { CombinedAnalysis, IngredientInput } from '../types';

export type BakeIntent = 'auto' | 'bread' | 'custard' | 'cake' | 'cookie';

export interface IngredientLineInput {
  ingredient_name: string;
  quantity_g?: number;
  quantity?: number;
  unit?: string;
}

export interface MixValidationInput {
  ingredients: IngredientLineInput[];
  intent?: BakeIntent;
  source_label?: string;
  source_url?: string;
  process?: FermentationProcessHints;
}

export interface DoughMetrics {
  flour_weight_g: number;
  water_weight_g: number;
  bakers_hydration_pct: number | null;
  /** Water ÷ flour counting only explicit flour/water lines (ignores starter split). */
  bakers_hydration_explicit_only_pct: number | null;
  salt_pct_of_flour: number | null;
  yeast_pct_of_flour: number | null;
  total_weight_g: number;
  sourdough_starter_g: number;
  starter_flour_equivalent_g: number;
  starter_water_equivalent_g: number;
  total_flour_for_bakers_pct_g: number;
  total_water_for_bakers_pct_g: number;
  total_liquid_water_g: number;
  bakers_hydration_total_liquid_pct: number | null;
  preferment_bakers_pct: number | null;
}

export interface ValidationCheck {
  id: string;
  severity: 'info' | 'warn' | 'fail';
  message: string;
}

function isYeast(ing: Ingredient): boolean {
  const n = ing.name.toLowerCase();
  return ing.leavening_type === 'biological' || n.includes('yeast');
}

function toDoughMetrics(adj: StarterAdjustedMetrics): DoughMetrics {
  return {
    flour_weight_g: adj.explicit_flour_g,
    water_weight_g: adj.explicit_water_g,
    bakers_hydration_pct: adj.bakers_hydration_pct,
    bakers_hydration_explicit_only_pct: explicitOnlyHydration(adj),
    salt_pct_of_flour: adj.salt_pct_of_flour,
    yeast_pct_of_flour: adj.yeast_pct_of_flour,
    total_weight_g: adj.total_weight_g,
    sourdough_starter_g: adj.sourdough_starter_g,
    starter_flour_equivalent_g: adj.starter_flour_equivalent_g,
    starter_water_equivalent_g: adj.starter_water_equivalent_g,
    total_flour_for_bakers_pct_g: adj.total_flour_for_bakers_pct_g,
    total_water_for_bakers_pct_g: adj.total_water_for_bakers_pct_g,
    total_liquid_water_g: adj.total_liquid_water_g,
    bakers_hydration_total_liquid_pct: adj.bakers_hydration_total_liquid_pct,
    preferment_bakers_pct: adj.preferment_bakers_pct
  };
}

function runPrefermentChecks(metrics: DoughMetrics, expectedPrefermentPct?: number): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  if (metrics.sourdough_starter_g > 0) {
    checks.push({
      id: 'starter_hydration_model',
      severity: 'info',
      message: `Starter ${metrics.sourdough_starter_g} g modeled as 50/50 flour/water at 100% hydration. Water-line hydration ${metrics.bakers_hydration_pct}%; total liquid ${metrics.bakers_hydration_total_liquid_pct ?? 'n/a'}%.`
    });
  }

  if (expectedPrefermentPct === undefined) return checks;

  if (metrics.preferment_bakers_pct === null) {
    checks.push({
      id: 'preferment_hint_no_starter',
      severity: 'info',
      message: `Process hints expect ~${expectedPrefermentPct}% preferment flour but no sourdough starter line was found — poolish/biga flour may be missing from the parsed list.`
    });
    return checks;
  }

  const diff = Math.abs(metrics.preferment_bakers_pct - expectedPrefermentPct);
  if (diff > 5) {
    checks.push({
      id: 'preferment_pct_mismatch',
      severity: 'warn',
      message: `Starter flour is ${metrics.preferment_bakers_pct}% of total flour vs process hint ${expectedPrefermentPct}% — check preferment/poolish ingredients or hydration model.`
    });
  }

  return checks;
}

function inferIntent(metrics: DoughMetrics, chemistry: CombinedAnalysis): BakeIntent {
  if (chemistry.recipe_classification.type === 'cheesecake_filling') return 'custard';
  if (chemistry.recipe_classification.type === 'bread_dough') return 'bread';
  if (metrics.flour_weight_g === 0) return 'custard';
  const h =
    metrics.bakers_hydration_total_liquid_pct ?? metrics.bakers_hydration_pct ?? 0;
  if (metrics.flour_weight_g > 0 && h >= 60) return 'bread';
  return 'cake';
}

function runChecks(
  intent: BakeIntent,
  metrics: DoughMetrics,
  chemistry: CombinedAnalysis,
  fermentationChecks: ValidationCheck[],
  extraChecks: ValidationCheck[],
  flourRatios: ReturnType<typeof computeFlourRelativeRatios>,
  processStyle: BakeProcessStyle
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  checks.push(...runIntentRatioChecks(intent, metrics, chemistry, flourRatios, processStyle));

  if (chemistry.leavening_analysis.adequacy === 'excessive') {
    checks.push({
      id: 'leavening_excessive',
      severity: 'fail',
      message: chemistry.leavening_analysis.notes
    });
  }

  for (const w of chemistry.warnings) {
    checks.push({ id: 'chemistry_warning', severity: 'warn', message: w });
  }

  checks.push(...fermentationChecks);
  checks.push(...extraChecks);

  if (checks.length === 0) {
    checks.push({
      id: 'no_flags',
      severity: 'info',
      message: 'No ratio or chemistry flags; process (time, temperature, steam) still dominates outcome.'
    });
  }

  return checks;
}

async function linesToGrams(
  lines: IngredientLineInput[]
): Promise<{
  gramsLines: NamedQuantity[];
  conversions: Array<{ ingredient_name: string; note: string }>;
  volumeRecords: VolumeConversionRecord[];
  packingChecks: ValidationCheck[];
  saltVolumeRecords: SaltConversionRecord[];
  errors: string[];
}> {
  const gramsLines: NamedQuantity[] = [];
  const conversions: Array<{ ingredient_name: string; note: string }> = [];
  const volumeRecords: VolumeConversionRecord[] = [];
  const packingChecks: ValidationCheck[] = [];
  const saltVolumeRecords: SaltConversionRecord[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    if (line.quantity_g !== undefined && line.quantity_g > 0) {
      gramsLines.push({ ingredient_name: line.ingredient_name, quantity_g: line.quantity_g });
      continue;
    }

    if (line.quantity !== undefined && line.unit) {
      const exact = await IngredientResolverService.findByName(line.ingredient_name);
      if (!exact) {
        errors.push(`Cannot convert units — ingredient not found: ${line.ingredient_name}`);
        continue;
      }
      try {
        const conv = convertToGrams(line.quantity, line.unit, exact);
        gramsLines.push({ ingredient_name: line.ingredient_name, quantity_g: conv.quantity_g });
        conversions.push({ ingredient_name: line.ingredient_name, note: conv.note });
        volumeRecords.push({
          ingredient_name: line.ingredient_name,
          amount: line.quantity,
          unit: line.unit,
          quantity_g: conv.quantity_g,
          catalog_name: exact.name
        });
        packingChecks.push(...flourCupPackingChecks(exact, line.quantity, line.unit, conv.quantity_g));
        if (exact.category === 'salt') {
          saltVolumeRecords.push({
            ingredient_name: line.ingredient_name,
            amount: line.quantity,
            unit: line.unit,
            quantity_g: conv.quantity_g,
            method: conv.method
          });
        }
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
      continue;
    }

    errors.push(`Each ingredient needs quantity_g or quantity+unit: ${line.ingredient_name}`);
  }

  return { gramsLines, conversions, volumeRecords, packingChecks, saltVolumeRecords, errors };
}

export class MixValidationService {
  static async validate(input: MixValidationInput) {
    const {
      gramsLines,
      conversions,
      volumeRecords,
      packingChecks,
      saltVolumeRecords,
      errors: convertErrors
    } = await linesToGrams(input.ingredients);
    if (convertErrors.length > 0) {
      return {
        success: false as const,
        error: convertErrors.join('; '),
        unresolved: [],
        partial_resolved: []
      };
    }

    const { resolved, unresolved } = await IngredientResolverService.resolve(gramsLines);

    if (unresolved.length > 0) {
      return {
        success: false as const,
        error: `Unresolved ingredients (not in catalog): ${unresolved.join(', ')}`,
        unresolved,
        partial_resolved: resolved
      };
    }

    const merged = IngredientResolverService.mergeByIngredientId(resolved);
    const catalog = await IngredientResolverService.fetchByIds(merged.map((m) => m.ingredient_id));

    const inputs: IngredientInput[] = merged.map((m) => ({
      ingredient_id: m.ingredient_id,
      quantity_g: m.quantity_g
    }));

    const chemistry = ChemistryService.analyzeCombination(inputs, catalog);
    const metrics = toDoughMetrics(computeStarterAdjustedMetrics(merged, catalog));
    const intent = input.intent === 'auto' || !input.intent ? inferIntent(metrics, chemistry) : input.intent;

    const yeastNames = merged
      .map((m) => catalog.find((c) => c.id === m.ingredient_id))
      .filter((c): c is Ingredient => Boolean(c && isYeast(c)))
      .map((c) => c.name);

    const fermentationChecks =
      intent === 'bread' || intent === 'auto'
        ? runFermentationHeuristics(metrics, input.process, yeastNames)
        : [];

    const prefermentChecks = runPrefermentChecks(metrics, input.process?.preferment_bakers_pct);
    const saltChecks = saltVolumeChecks(
      saltVolumeRecords,
      metrics.salt_pct_of_flour,
      metrics.total_flour_for_bakers_pct_g
    );
    const flourRatios = computeFlourRelativeRatios(merged, catalog);
    const checks = runChecks(
      intent,
      metrics,
      chemistry,
      fermentationChecks,
      [...packingChecks, ...prefermentChecks, ...saltChecks],
      flourRatios,
      input.process?.style ?? 'unknown'
    );

    const hasFail = checks.some((c) => c.severity === 'fail');
    const hasWarn = checks.some((c) => c.severity === 'warn');

    return {
      success: true as const,
      source_label: input.source_label ?? null,
      source_url: input.source_url ?? null,
      intent_used: intent,
      resolved_ingredients: merged.map((m) => ({
        requested_name: m.ingredient_name,
        catalog_name: m.matched_name,
        ingredient_id: m.ingredient_id,
        quantity_g: m.quantity_g,
        match: m.match
      })),
      unit_conversions: conversions.length > 0 ? conversions : null,
      volume_conversions: volumeRecords.length > 0 ? volumeRecords : null,
      process_hints: input.process ?? null,
      dough_metrics: metrics,
      flour_ratios: flourRatios,
      chemistry,
      validation: {
        status: hasFail ? 'fail' : hasWarn ? 'warn' : 'ok',
        checks
      },
      agent_guidance: [
        'BakeBase does not author recipes — it validates ingredient lists against the catalog and baking science.',
        'Resolve names to catalog entries; fuzzy matches are flagged via match=search.',
        'Lean bread: dough_metrics.bakers_hydration_pct (free water). Enriched/brioche: use bakers_hydration_total_liquid_pct (milk/egg water included).',
        'Set intent (bread, cake, cookie, custard) or auto; process.style (pizza, enriched_bread, muffin_quick_bread, rolls, …) sharpens checks.',
        'Pass process.cold_retard_hours, yeast_type, target_dough_temp_c when parsing fermentation-heavy recipes.',
        'Use quantity+unit on ingredients for cup/tsp conversion (density from catalog; packing varies).',
        'Oven technique and steam are still outside this API.'
      ]
    };
  }
}
