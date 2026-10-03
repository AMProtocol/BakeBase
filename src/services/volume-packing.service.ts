import { Ingredient } from '@prisma/client';
import { ValidationCheck } from './mix-validation.service';
import { normalizeUnit, SALT_GRAMS_PER_TSP } from './unit-conversion.service';

/** Typical US cup of wheat flour by scoop/spoon style (grams per 1 cup). */
export const FLOUR_GRAMS_PER_CUP = {
  min: 120,
  typical: 140,
  max: 155
};

export function isFlourLike(ingredient: Ingredient): boolean {
  return ingredient.category === 'flour' || ingredient.gluten_forming;
}

export interface VolumeConversionRecord {
  ingredient_name: string;
  amount: number;
  unit: string;
  quantity_g: number;
  catalog_name: string;
}

export function flourCupPackingChecks(
  ingredient: Ingredient,
  amount: number,
  unit: string,
  quantityG: number
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const u = normalizeUnit(unit);
  if (u !== 'cup' && u !== 'cups') return checks;
  if (!isFlourLike(ingredient)) return checks;

  const low = FLOUR_GRAMS_PER_CUP.min * amount;
  const high = FLOUR_GRAMS_PER_CUP.max * amount;
  const typical = FLOUR_GRAMS_PER_CUP.typical * amount;

  checks.push({
    id: 'flour_cup_packing_band',
    severity: 'info',
    message: `Flour by cup is imprecise: ${amount} cup(s) is often cited as ~${low}–${high} g (scoop vs spoon); catalog density conversion gave ${quantityG} g (typical ref ~${Math.round(typical)} g). AI/web recipes using cups may disagree by 10%+ from scale weights.`
  });

  if (quantityG < low * 0.9 || quantityG > high * 1.1) {
    checks.push({
      id: 'flour_cup_density_outlier',
      severity: 'warn',
      message: `Converted ${quantityG} g for ${amount} cup(s) ${ingredient.name} sits outside the common ${low}–${high} g packing band — double-check source or weigh flour.`
    });
  }

  return checks;
}

export interface SaltConversionRecord {
  ingredient_name: string;
  amount: number;
  unit: string;
  quantity_g: number;
  method: string;
}

export function saltVolumeChecks(
  records: SaltConversionRecord[],
  saltPctOfFlour: number | null,
  totalFlourG: number
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const saltPct = saltPctOfFlour;
  if (saltPct === null) return checks;

  for (const r of records) {
    if (r.method === 'density_volume' && saltPct > 2.4) {
      checks.push({
        id: 'salt_density_volume_high',
        severity: 'warn',
        message: `Salt ${r.amount} ${r.unit} converted to ${r.quantity_g} g via catalog density — that is ${saltPct}% of flour (typical bread ~1.8–2.2%). Try gram weight or ~${SALT_GRAMS_PER_TSP} g/tsp fine salt.`
      });
    }
  }

  if (saltPct > 2.5 && records.length === 0 && totalFlourG > 0) {
    checks.push({
      id: 'salt_pct_high',
      severity: 'warn',
      message: `Salt is ${saltPct}% of flour — above typical bread range; confirm source amounts.`
    });
  }

  return checks;
}
