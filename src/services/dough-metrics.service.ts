import { Ingredient } from '@prisma/client';
import { ResolvedQuantity } from './ingredient-resolver.service';

export interface StarterAdjustedMetrics {
  /** Flour-only ingredients (excludes starter mass as a single blob). */
  explicit_flour_g: number;
  explicit_water_g: number;
  sourdough_starter_g: number;
  /** Assumes 100% hydration ripe starter: half flour, half water by weight. */
  starter_flour_equivalent_g: number;
  starter_water_equivalent_g: number;
  total_flour_for_bakers_pct_g: number;
  total_water_for_bakers_pct_g: number;
  bakers_hydration_pct: number | null;
  /** Starter flour ÷ total flour (baker's preferment %). */
  preferment_bakers_pct: number | null;
  salt_pct_of_flour: number | null;
  yeast_pct_of_flour: number | null;
  total_weight_g: number;
}

function isFlour(ing: Ingredient): boolean {
  return ing.category === 'flour' || ing.gluten_forming;
}

function isWater(ing: Ingredient): boolean {
  return ing.name.toLowerCase() === 'water';
}

function isSalt(ing: Ingredient): boolean {
  if (ing.category === 'salt') return true;
  const n = ing.name.toLowerCase();
  if (n.includes('unsalted')) return false;
  return /\bsalt\b/.test(n) || n.endsWith(' salt');
}

function isYeast(ing: Ingredient): boolean {
  const n = ing.name.toLowerCase();
  return ing.leavening_type === 'biological' || n.includes('yeast');
}

function isSourdoughStarter(ing: Ingredient): boolean {
  return ing.name.toLowerCase() === 'sourdough starter';
}

export function computeStarterAdjustedMetrics(
  merged: ResolvedQuantity[],
  catalog: Ingredient[]
): StarterAdjustedMetrics {
  const byId = new Map(catalog.map((c) => [c.id, c]));
  let explicitFlour = 0;
  let explicitWater = 0;
  let salt = 0;
  let yeast = 0;
  let starter = 0;
  let total = 0;

  for (const line of merged) {
    const ing = byId.get(line.ingredient_id);
    if (!ing) continue;
    total += line.quantity_g;

    if (isSourdoughStarter(ing)) {
      starter += line.quantity_g;
      continue;
    }
    if (isFlour(ing)) explicitFlour += line.quantity_g;
    if (isWater(ing)) explicitWater += line.quantity_g;
    if (isSalt(ing)) salt += line.quantity_g;
    if (isYeast(ing)) yeast += line.quantity_g;
  }

  const starterFlourEq = starter / 2;
  const starterWaterEq = starter / 2;
  const totalFlour = explicitFlour + starterFlourEq;
  const totalWater = explicitWater + starterWaterEq;

  return {
    explicit_flour_g: explicitFlour,
    explicit_water_g: explicitWater,
    sourdough_starter_g: starter,
    starter_flour_equivalent_g: Math.round(starterFlourEq * 10) / 10,
    starter_water_equivalent_g: Math.round(starterWaterEq * 10) / 10,
    total_flour_for_bakers_pct_g: Math.round(totalFlour * 10) / 10,
    total_water_for_bakers_pct_g: Math.round(totalWater * 10) / 10,
    bakers_hydration_pct:
      totalFlour > 0 ? Math.round((totalWater / totalFlour) * 1000) / 10 : null,
    preferment_bakers_pct:
      totalFlour > 0 && starter > 0
        ? Math.round((starterFlourEq / totalFlour) * 10000) / 100
        : null,
    salt_pct_of_flour: totalFlour > 0 ? Math.round((salt / totalFlour) * 10000) / 100 : null,
    yeast_pct_of_flour: totalFlour > 0 ? Math.round((yeast / totalFlour) * 10000) / 100 : null,
    total_weight_g: total
  };
}

export function explicitOnlyHydration(adj: StarterAdjustedMetrics): number | null {
  if (adj.explicit_flour_g <= 0) return null;
  return Math.round((adj.explicit_water_g / adj.explicit_flour_g) * 1000) / 10;
}
