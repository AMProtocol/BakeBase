import { Ingredient } from '@prisma/client';
import { BakeProcessStyle } from './fermentation-heuristics.service';
import { ResolvedQuantity } from './ingredient-resolver.service';
import { BakeIntent, DoughMetrics, ValidationCheck } from './mix-validation.service';
import { CombinedAnalysis } from '../types';

export interface FlourRelativeRatios {
  total_flour_g: number;
  fat_pct_of_flour: number | null;
  sugar_pct_of_flour: number | null;
  egg_pct_of_flour: number | null;
}

function isFlour(ing: Ingredient): boolean {
  return ing.category === 'flour' || ing.gluten_forming;
}

function isFat(ing: Ingredient): boolean {
  return ing.category === 'fat' || ing.category === 'oil' || ing.name.toLowerCase().includes('butter');
}

function isSugar(ing: Ingredient): boolean {
  const n = ing.name.toLowerCase();
  return ing.category === 'sugar' || ing.category === 'syrup' || n.includes('honey') || n.includes('molasses');
}

function isEgg(ing: Ingredient): boolean {
  return ing.category === 'egg';
}

export function computeFlourRelativeRatios(
  merged: ResolvedQuantity[],
  catalog: Ingredient[]
): FlourRelativeRatios {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  let flour = 0;
  let fat = 0;
  let sugar = 0;
  let egg = 0;

  for (const line of merged) {
    const ing = byId.get(line.ingredient_id);
    if (!ing) continue;
    if (isFlour(ing)) flour += line.quantity_g;
    if (isFat(ing)) fat += line.quantity_g;
    if (isSugar(ing)) sugar += line.quantity_g;
    if (isEgg(ing)) egg += line.quantity_g;
  }

  const pct = (part: number) =>
    flour > 0 ? Math.round((part / flour) * 10000) / 100 : null;

  return {
    total_flour_g: flour,
    fat_pct_of_flour: pct(fat),
    sugar_pct_of_flour: pct(sugar),
    egg_pct_of_flour: pct(egg)
  };
}

function breadProfile(
  metrics: DoughMetrics,
  ratios: FlourRelativeRatios,
  style: BakeProcessStyle
): 'lean' | 'enriched' | 'sourdough' | 'pizza' {
  if (style === 'pizza') return 'pizza';
  if (style === 'enriched_bread' || style === 'pastry') return 'enriched';
  if (style === 'sourdough' || metrics.sourdough_starter_g > 0) return 'sourdough';
  if ((ratios.fat_pct_of_flour ?? 0) >= 8 || (ratios.sugar_pct_of_flour ?? 0) >= 6) return 'enriched';
  return 'lean';
}

function runBreadChecks(
  metrics: DoughMetrics,
  chemistry: CombinedAnalysis,
  ratios: FlourRelativeRatios,
  style: BakeProcessStyle
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const profile = breadProfile(metrics, ratios, style);
  const h = metrics.bakers_hydration_pct;

  if (h !== null) {
    if (profile === 'pizza') {
      if (h < 55 || h > 70) {
        checks.push({
          id: 'hydration_pizza_band',
          severity: 'warn',
          message: `Hydration ${h}% is outside a typical pizza dough window (~58–65%); adjust water or flour if targeting Neapolitan vs pan styles.`
        });
      } else {
        checks.push({
          id: 'hydration_pizza_ok',
          severity: 'info',
          message: `Hydration ${h}% fits common pizza dough ranges.`
        });
      }
    } else if (profile === 'enriched') {
      if (h < 48) {
        checks.push({
          id: 'hydration_enriched_low',
          severity: 'warn',
          message: `Hydration ${h}% is low for enriched dough (brioche, challah, soft rolls often ~50–65% with extra fat/sugar).`
        });
      } else if (h > 72) {
        checks.push({
          id: 'hydration_enriched_high',
          severity: 'info',
          message: `Hydration ${h}% is high for a fat-rich dough — expect slack dough unless flour is very strong.`
        });
      } else {
        checks.push({
          id: 'hydration_enriched_ok',
          severity: 'info',
          message: `Hydration ${h}% is plausible for enriched bread (fat ~${ratios.fat_pct_of_flour ?? '?'}% of flour).`
        });
      }
    } else if (profile === 'sourdough') {
      if (h !== null && h < 65) {
        checks.push({
          id: 'hydration_sourdough_low',
          severity: 'info',
          message: `Hydration ${h}% is on the stiff side for many sourdough loaves (often ~70–80% total).`
        });
      } else if (h !== null && h > 88) {
        checks.push({
          id: 'hydration_sourdough_high',
          severity: 'info',
          message: `Hydration ${h}% is very wet — common for some country loaves; handling skill matters.`
        });
      } else if (h !== null) {
        checks.push({
          id: 'hydration_sourdough_ok',
          severity: 'info',
          message: `Hydration ${h}% (starter-adjusted) is in a typical sourdough ballpark.`
        });
      }
    } else {
      if (h < 58) {
        checks.push({
          id: 'hydration_low',
          severity: 'warn',
          message: `Baker's hydration ${h}% is low for lean yeasted bread (many loaves ~62–78%). Crumb can feel dry if bake is long.`
        });
      } else if (h > 85) {
        checks.push({
          id: 'hydration_high',
          severity: 'info',
          message: `Hydration ${h}% is very high — expect sticky dough (ciabatta/high-hydration territory).`
        });
      } else {
        checks.push({
          id: 'hydration_ok',
          severity: 'info',
          message: `Baker's hydration ${h}% is in a normal range for lean yeasted bread.`
        });
      }
    }
  } else if (metrics.total_flour_for_bakers_pct_g > 0) {
    checks.push({
      id: 'hydration_unknown',
      severity: 'warn',
      message: 'Flour present but no Water ingredient — cannot compute baker’s hydration.'
    });
  }

  if (metrics.salt_pct_of_flour !== null) {
    const lo = profile === 'enriched' ? 1.4 : 1.5;
    const hi = profile === 'enriched' ? 2.4 : 2.5;
    if (metrics.salt_pct_of_flour < lo || metrics.salt_pct_of_flour > hi) {
      checks.push({
        id: 'salt_unusual',
        severity: 'warn',
        message: `Salt is ${metrics.salt_pct_of_flour}% of flour (typical bread ~1.8–2.2%).`
      });
    }
  }

  if (metrics.yeast_pct_of_flour !== null && metrics.yeast_pct_of_flour < 0.35) {
    const note =
      profile === 'sourdough'
        ? 'Very low commercial yeast — normal when sourdough starter carries fermentation.'
        : 'Very low yeast — pair with long bulk or cold retard.';
    checks.push({
      id: 'yeast_very_low',
      severity: 'info',
      message: `Yeast ${metrics.yeast_pct_of_flour}% of flour. ${note}`
    });
  }

  const hasBio = chemistry.leavening_analysis.biological_present;
  const hasStarter = metrics.sourdough_starter_g > 0;
  if (!hasBio && !hasStarter && metrics.total_flour_for_bakers_pct_g > 100) {
    checks.push({
      id: 'no_leavening',
      severity: 'warn',
      message: 'No yeast/starter detected — lean bread may not rise unless preferment lines were missed in parsing.'
    });
  }

  if (chemistry.leavening_analysis.chemical_present && !hasBio && profile === 'lean') {
    checks.push({
      id: 'chemical_in_bread',
      severity: 'info',
      message: 'Chemical leavener in a bread-class mix — OK for some quick breads; unusual for long-ferment lean loaves.'
    });
  }

  return checks;
}

function runCakeChecks(chemistry: CombinedAnalysis, ratios: FlourRelativeRatios): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  if (ratios.total_flour_g <= 0) return checks;

  const sugar = ratios.sugar_pct_of_flour;
  const fat = ratios.fat_pct_of_flour;
  const egg = ratios.egg_pct_of_flour;

  if (sugar !== null) {
    if (sugar < 70) {
      checks.push({
        id: 'cake_sugar_low',
        severity: 'info',
        message: `Sugar ${sugar}% of flour is low for typical American butter cake (often ~90–120%) — may read more muffin or bread-like.`
      });
    } else if (sugar > 140) {
      checks.push({
        id: 'cake_sugar_high',
        severity: 'warn',
        message: `Sugar ${sugar}% of flour is very high — structure may collapse without enough egg, fat, or emulsification.`
      });
    } else {
      checks.push({
        id: 'cake_sugar_ok',
        severity: 'info',
        message: `Sugar ${sugar}% of flour is in a common cake range.`
      });
    }
  }

  if (fat !== null && fat < 25) {
    checks.push({
      id: 'cake_fat_low',
      severity: 'info',
      message: `Fat ${fat}% of flour is lean for cake — expect a drier or more bread-like crumb unless dairy/egg adds richness.`
    });
  }

  if (egg !== null && egg < 40) {
    checks.push({
      id: 'cake_egg_low',
      severity: 'info',
      message: `Egg ${egg}% of flour is modest — chiffon/sponge styles usually need more egg for lift and moisture.`
    });
  }

  if (
    !chemistry.leavening_analysis.chemical_present &&
    !chemistry.leavening_analysis.biological_present &&
    (sugar ?? 0) > 80
  ) {
    checks.push({
      id: 'cake_leavening_missing',
      severity: 'warn',
      message: 'Sweet flour mix with no detected leavener — verify baking powder/soda or whipped egg method in source recipe.'
    });
  }

  const ha = chemistry.hydration_analysis;
  if (ha.assessment === 'batter' || (ha.hydration_ratio_pct !== null && ha.hydration_ratio_pct > 100)) {
    checks.push({
      id: 'cake_batter_hydration',
      severity: 'info',
      message: 'Liquids are high vs flour — pourable batter behavior is expected (layer cake, loaf cake).'
    });
  }

  return checks;
}

function runCookieChecks(
  metrics: DoughMetrics,
  chemistry: CombinedAnalysis,
  ratios: FlourRelativeRatios
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  if (ratios.total_flour_g <= 0) return checks;

  const sugar = ratios.sugar_pct_of_flour ?? 0;
  const fat = ratios.fat_pct_of_flour ?? 0;
  const flour = ratios.total_flour_g;

  if (fat > 0 && sugar > 0) {
    const richness = (fat + sugar) / flour;
    if (richness > 1.4) {
      checks.push({
        id: 'cookie_high_spread',
        severity: 'info',
        message: `Fat+sugar vs flour is rich (~${Math.round(richness * 100)}% combined vs flour) — expect spread unless flour is increased or dough is chilled.`
      });
    } else if (richness < 0.5) {
      checks.push({
        id: 'cookie_shortbread_like',
        severity: 'info',
        message: 'Low fat+sugar vs flour — shortbread or dry biscuit texture is likely.'
      });
    }
  }

  if (metrics.bakers_hydration_pct !== null && metrics.bakers_hydration_pct < 15) {
    checks.push({
      id: 'cookie_low_hydration',
      severity: 'info',
      message: `Low water/flour ratio (${metrics.bakers_hydration_pct}%) — typical for slice-and-bake or high-fat cookies.`
    });
  }

  if (chemistry.leavening_analysis.chemical_present && !chemistry.leavening_analysis.biological_present) {
    checks.push({
      id: 'cookie_chemical_leaven',
      severity: 'info',
      message: 'Chemical leavener present — match baking soda to any acidic ingredients in the source (brown sugar, cocoa, etc.).'
    });
  }

  return checks;
}

function runCustardChecks(chemistry: CombinedAnalysis, ratios: FlourRelativeRatios): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const type = chemistry.recipe_classification.type;

  if (type === 'cheesecake_filling') {
    checks.push({
      id: 'custard_cheesecake',
      severity: 'info',
      message: 'Cheesecake-style filling — structure from eggs + cream cheese, not gluten. Validate bake temp/time in source, not here.'
    });
  } else if (type === 'graham_crust') {
    checks.push({
      id: 'custard_crust_only',
      severity: 'info',
      message: 'Crumb crust only — usually paired with a wet filling; validate filling separately.'
    });
  } else if (type === 'baked_custard' || ratios.total_flour_g === 0) {
    checks.push({
      id: 'custard_flourless',
      severity: 'info',
      message: 'Flourless egg-dairy set — doneness is temperature/time sensitive; ratios here are informational only.'
    });
  }

  if (ratios.total_flour_g > 0 && (ratios.sugar_pct_of_flour ?? 0) > 60) {
    checks.push({
      id: 'custard_flour_sugar',
      severity: 'info',
      message: 'Flour and high sugar together — may be cake or pudding, not a classic custard; consider intent cake or bread.'
    });
  }

  return checks;
}

function runQuickBreadChecks(chemistry: CombinedAnalysis, ratios: FlourRelativeRatios): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  if (!chemistry.leavening_analysis.chemical_present) return checks;
  if (chemistry.leavening_analysis.biological_present) return checks;
  if (ratios.total_flour_g < 50) return checks;

  checks.push({
    id: 'quick_bread_leavening',
    severity: 'info',
    message: 'Chemical leavener without yeast — muffin/banana-bread/scone class; mix minimally and bake soon after wetting.'
  });

  const h = chemistry.hydration_analysis.hydration_ratio_pct;
  if (h !== null && h > 110) {
    checks.push({
      id: 'quick_bread_wet_batter',
      severity: 'info',
      message: 'Wet batter quick bread — verify pan size and bake time in source; center may need longer.'
    });
  }

  return checks;
}

/**
 * Intent-aware ratio checks across bread, cake, cookie, custard, and quick breads.
 */
export function runIntentRatioChecks(
  intent: BakeIntent,
  metrics: DoughMetrics,
  chemistry: CombinedAnalysis,
  ratios: FlourRelativeRatios,
  processStyle: BakeProcessStyle = 'unknown'
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const classification = chemistry.recipe_classification.type;

  const effectiveIntent =
    intent === 'auto'
      ? classification === 'cheesecake_filling' || classification === 'baked_custard'
        ? 'custard'
        : classification === 'cake_batter'
          ? 'cake'
          : classification === 'cookie_dough'
            ? 'cookie'
            : classification === 'bread_dough' || (metrics.bakers_hydration_pct ?? 0) >= 58
              ? 'bread'
              : 'cake'
      : intent;

  if (effectiveIntent === 'bread' || (intent === 'auto' && classification === 'bread_dough')) {
    checks.push(...runBreadChecks(metrics, chemistry, ratios, processStyle));
  }
  if (effectiveIntent === 'cake') {
    checks.push(...runCakeChecks(chemistry, ratios));
  }
  if (effectiveIntent === 'cookie') {
    checks.push(...runCookieChecks(metrics, chemistry, ratios));
  }
  if (effectiveIntent === 'custard') {
    checks.push(...runCustardChecks(chemistry, ratios));
  }

  if (
    intent === 'auto' &&
    chemistry.leavening_analysis.chemical_present &&
    !chemistry.leavening_analysis.biological_present &&
    effectiveIntent !== 'cake' &&
    effectiveIntent !== 'cookie'
  ) {
    checks.push(...runQuickBreadChecks(chemistry, ratios));
  }

  if (metrics.flour_weight_g === 0 && effectiveIntent !== 'custard') {
    checks.push({
      id: 'no_flour',
      severity: 'info',
      message: 'No flour in mix — set structure is from eggs/dairy/fat, not gluten.'
    });
  }

  return checks;
}
