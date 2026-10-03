import { Ingredient } from '@prisma/client';
import { ChemistryService } from './chemistry.service';
import { IngredientResolverService, NamedQuantity, ResolvedQuantity } from './ingredient-resolver.service';
import { CombinedAnalysis, IngredientInput } from '../types';

export type BakeIntent = 'auto' | 'bread' | 'custard' | 'cake' | 'cookie';

export interface MixValidationInput {
  ingredients: NamedQuantity[];
  intent?: BakeIntent;
  source_label?: string;
  source_url?: string;
}

export interface DoughMetrics {
  flour_weight_g: number;
  water_weight_g: number;
  bakers_hydration_pct: number | null;
  salt_pct_of_flour: number | null;
  yeast_pct_of_flour: number | null;
  total_weight_g: number;
}

export interface ValidationCheck {
  id: string;
  severity: 'info' | 'warn' | 'fail';
  message: string;
}

function isFlour(ing: Ingredient): boolean {
  return ing.category === 'flour' || ing.gluten_forming;
}

function isWater(ing: Ingredient): boolean {
  return ing.name.toLowerCase() === 'water';
}

function isSalt(ing: Ingredient): boolean {
  return ing.category === 'salt' || ing.name.toLowerCase().includes('salt');
}

function isYeast(ing: Ingredient): boolean {
  const n = ing.name.toLowerCase();
  return ing.leavening_type === 'biological' || n.includes('yeast');
}

function computeMetrics(merged: ResolvedQuantity[], catalog: Ingredient[]): DoughMetrics {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  let flour = 0;
  let water = 0;
  let salt = 0;
  let yeast = 0;
  let total = 0;

  for (const line of merged) {
    const ing = byId.get(line.ingredient_id);
    if (!ing) continue;
    total += line.quantity_g;
    if (isFlour(ing)) flour += line.quantity_g;
    if (isWater(ing)) water += line.quantity_g;
    if (isSalt(ing)) salt += line.quantity_g;
    if (isYeast(ing)) yeast += line.quantity_g;
  }

  return {
    flour_weight_g: flour,
    water_weight_g: water,
    bakers_hydration_pct: flour > 0 ? Math.round((water / flour) * 1000) / 10 : null,
    salt_pct_of_flour: flour > 0 ? Math.round((salt / flour) * 10000) / 100 : null,
    yeast_pct_of_flour: flour > 0 ? Math.round((yeast / flour) * 10000) / 100 : null,
    total_weight_g: total
  };
}

function inferIntent(metrics: DoughMetrics, chemistry: CombinedAnalysis): BakeIntent {
  if (chemistry.recipe_classification.type === 'cheesecake_filling') return 'custard';
  if (chemistry.recipe_classification.type === 'bread_dough') return 'bread';
  if (metrics.flour_weight_g === 0) return 'custard';
  if (metrics.flour_weight_g > 0 && (metrics.bakers_hydration_pct ?? 0) >= 60) return 'bread';
  return 'cake';
}

function runChecks(intent: BakeIntent, metrics: DoughMetrics, chemistry: CombinedAnalysis): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  if (metrics.flour_weight_g === 0) {
    checks.push({
      id: 'no_flour',
      severity: 'info',
      message: 'No flour in mix — custard/cheesecake-style set, not gluten structure.'
    });
  }

  if (intent === 'bread' || intent === 'auto') {
    if (metrics.bakers_hydration_pct !== null) {
      if (metrics.bakers_hydration_pct < 58) {
        checks.push({
          id: 'hydration_low',
          severity: 'warn',
          message: `Baker's hydration ${metrics.bakers_hydration_pct}% is low for lean bread (typical artisan baguette ~68–78%). Crumb may taste dry if no extra water was lost in baking.`
        });
      } else if (metrics.bakers_hydration_pct > 85) {
        checks.push({
          id: 'hydration_high',
          severity: 'info',
          message: `Baker's hydration ${metrics.bakers_hydration_pct}% is very high — sticky dough is expected until fully developed.`
        });
      } else {
        checks.push({
          id: 'hydration_ok',
          severity: 'info',
          message: `Baker's hydration ${metrics.bakers_hydration_pct}% is in a normal range for yeasted bread.`
        });
      }
    } else if (metrics.flour_weight_g > 0) {
      checks.push({
        id: 'hydration_unknown',
        severity: 'warn',
        message: 'Flour present but no Water ingredient — cannot compute baker’s hydration (water/flour).'
      });
    }

    if (metrics.salt_pct_of_flour !== null) {
      if (metrics.salt_pct_of_flour < 1.5 || metrics.salt_pct_of_flour > 2.5) {
        checks.push({
          id: 'salt_unusual',
          severity: 'warn',
          message: `Salt is ${metrics.salt_pct_of_flour}% of flour (typical bread ~1.8–2.2%).`
        });
      }
    }

    if (metrics.yeast_pct_of_flour !== null && metrics.yeast_pct_of_flour < 0.35) {
      checks.push({
        id: 'yeast_very_low',
        severity: 'info',
        message: `Yeast ${metrics.yeast_pct_of_flour}% of flour — very low; long cold ferment is normal (e.g. baguette recipes).`
      });
    }

    if (!chemistry.leavening_analysis.biological_present && metrics.flour_weight_g > 100) {
      checks.push({
        id: 'no_yeast',
        severity: 'warn',
        message: 'No biological leavening detected in catalog match — bread may not rise as expected.'
      });
    }
  }

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

  if (checks.length === 0) {
    checks.push({
      id: 'no_flags',
      severity: 'info',
      message: 'No ratio or chemistry flags; process (time, temperature, steam) still dominates outcome.'
    });
  }

  return checks;
}

export class MixValidationService {
  static async validate(input: MixValidationInput) {
    const { resolved, unresolved } = await IngredientResolverService.resolve(input.ingredients);

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
    const metrics = computeMetrics(merged, catalog);
    const intent = input.intent === 'auto' || !input.intent ? inferIntent(metrics, chemistry) : input.intent;
    const checks = runChecks(intent, metrics, chemistry);

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
      dough_metrics: metrics,
      chemistry,
      validation: {
        status: hasFail ? 'fail' : hasWarn ? 'warn' : 'ok',
        checks
      },
      agent_guidance: [
        'BakeBase does not author recipes — it validates ingredient lists against the catalog and baking science.',
        'Resolve names to catalog entries; fuzzy matches are flagged via match=search.',
        'Use dough_metrics.bakers_hydration_pct for lean bread; combine for chemistry and classification.',
        'Oven technique, fermentation time, and steam are outside this API.'
      ]
    };
  }
}
