import { Ingredient } from '@prisma/client';
import { IngredientResolverService } from './ingredient-resolver.service';

/** US customary volumes → milliliters */
const ML_PER_UNIT: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.92892,
  teaspoon: 4.92892,
  teaspoons: 4.92892,
  tbsp: 14.7868,
  tablespoon: 14.7868,
  tablespoons: 14.7868,
  cup: 236.588,
  cups: 236.588,
  'fl oz': 29.5735,
  floz: 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  pound: 453.592,
  pounds: 453.592
};

/** Culinary fine table salt — density×tsp over-estimates vs weighing. */
export const SALT_GRAMS_PER_TSP = 6;
export const SALT_GRAMS_PER_TBSP = 18;

export interface ConversionResult {
  quantity_g: number;
  method: 'direct_weight' | 'density_volume' | 'salt_volume_heuristic' | 'assumed_weight_oz';
  note: string;
}

function isSaltIngredient(ingredient: Ingredient): boolean {
  if (ingredient.category === 'salt') return true;
  const n = ingredient.name.toLowerCase();
  if (n.includes('unsalted')) return false;
  return /\bsalt\b/.test(n) || n.endsWith(' salt');
}

export function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim().replace(/_/g, ' ');
}

export function convertToGrams(
  amount: number,
  unit: string,
  ingredient: Ingredient
): ConversionResult {
  const u = normalizeUnit(unit);

  if (u === 'g' || u === 'gram' || u === 'grams') {
    return { quantity_g: amount, method: 'direct_weight', note: 'Already in grams' };
  }
  if (u === 'kg' || u === 'kilogram' || u === 'kilograms') {
    return { quantity_g: amount * 1000, method: 'direct_weight', note: 'Converted from kilograms' };
  }

  if ((u === 'oz' || u === 'ounce' || u === 'ounces') && ingredient.standard_measurement_unit === 'weight') {
    return {
      quantity_g: amount * ML_PER_UNIT.oz,
      method: 'assumed_weight_oz',
      note: 'Treated as weight ounces (not fluid ounces)'
    };
  }

  if (u === 'lb' || u === 'pound' || u === 'pounds') {
    return { quantity_g: amount * ML_PER_UNIT.lb, method: 'direct_weight', note: 'Converted from pounds' };
  }

  const mlPer = ML_PER_UNIT[u];
  if (mlPer === undefined) {
    throw new Error(`Unsupported unit: ${unit}`);
  }

  if (isSaltIngredient(ingredient)) {
    if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') {
      const quantity_g = Math.round(amount * SALT_GRAMS_PER_TSP * 100) / 100;
      return {
        quantity_g,
        method: 'salt_volume_heuristic',
        note: `Fine salt ~${SALT_GRAMS_PER_TSP} g/tsp (tablespoon measure); prefer grams from a scale when available.`
      };
    }
    if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') {
      const quantity_g = Math.round(amount * SALT_GRAMS_PER_TBSP * 100) / 100;
      return {
        quantity_g,
        method: 'salt_volume_heuristic',
        note: `Fine salt ~${SALT_GRAMS_PER_TBSP} g/tbsp; prefer grams when available.`
      };
    }
  }

  const density = ingredient.density_g_per_ml;
  if (density === null || density === undefined) {
    throw new Error(
      `No density_g_per_ml for ${ingredient.name}; cannot convert volume (${unit}) to grams`
    );
  }

  const ml = amount * mlPer;
  const grams = ml * density;

  return {
    quantity_g: Math.round(grams * 100) / 100,
    method: 'density_volume',
    note: `Used catalog density ${density} g/ml for ${ingredient.name}; volume is approximate (packing varies).`
  };
}

export class UnitConversionService {
  static supportedUnits(): string[] {
    return Object.keys(ML_PER_UNIT).filter((k) => k.length <= 10);
  }

  static async convertByIngredientName(
    ingredientName: string,
    amount: number,
    unit: string
  ): Promise<{ catalog_name: string; ingredient_id: string; conversion: ConversionResult }> {
    const ing = await IngredientResolverService.findByName(ingredientName);
    if (!ing) {
      throw new Error(`Ingredient not in catalog: ${ingredientName}`);
    }
    const conversion = convertToGrams(amount, unit, ing);
    return { catalog_name: ing.name, ingredient_id: ing.id, conversion };
  }
}
