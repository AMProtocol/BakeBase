import { DoughMetrics, ValidationCheck } from './mix-validation.service';

export type YeastTypeHint = 'instant' | 'active_dry' | 'fresh' | 'unknown';

/** Broad bake style for ratio + fermentation hints (not a recipe taxonomy). */
export type BakeProcessStyle =
  | 'lean_bread'
  | 'enriched_bread'
  | 'sourdough'
  | 'pizza'
  | 'baguette'
  | 'sandwich_loaf'
  | 'rolls'
  | 'quick_yeast'
  | 'muffin_quick_bread'
  | 'cake'
  | 'cookie'
  | 'pastry'
  | 'unknown';

export interface FermentationProcessHints {
  yeast_type?: YeastTypeHint;
  cold_retard_hours?: number;
  room_temp_bulk_hours?: number;
  style?: BakeProcessStyle;
  /** Desired dough temperature after mix (DDT), °C. */
  target_dough_temp_c?: number;
  /** Ambient / kitchen temperature during mix, °C. */
  ambient_temp_c?: number;
  /** Expected preferment flour as % of total flour (starter flour or poolish). */
  preferment_bakers_pct?: number;
}

export function yeastTypeFromCatalog(name: string): YeastTypeHint {
  const n = name.toLowerCase();
  if (n.includes('instant')) return 'instant';
  if (n.includes('active dry')) return 'active_dry';
  if (n.includes('fresh')) return 'fresh';
  return 'unknown';
}

/**
 * Heuristic fermentation guidance — not a substitute for time/temp measurement.
 */
export function runFermentationHeuristics(
  metrics: DoughMetrics,
  hints: FermentationProcessHints | undefined,
  yeastCatalogNames: string[]
): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const yeastPct = metrics.yeast_pct_of_flour;
  const flourForChecks = metrics.total_flour_for_bakers_pct_g || metrics.flour_weight_g;
  if (yeastPct === null && hints?.target_dough_temp_c === undefined) {
    return checks;
  }
  if (flourForChecks < 50 && hints?.target_dough_temp_c === undefined) {
    return checks;
  }

  const style = hints?.style ?? 'unknown';
  const coldH = hints?.cold_retard_hours;
  const roomH = hints?.room_temp_bulk_hours;
  const yeastHint = hints?.yeast_type ?? 'unknown';

  const catalogYeast = yeastCatalogNames.map((n) => n.toLowerCase());
  const hasInstant = catalogYeast.some((n) => n.includes('instant'));
  const hasActiveDry = catalogYeast.some((n) => n.includes('active dry'));
  const hasFresh = catalogYeast.some((n) => n.includes('fresh'));

  if (yeastPct !== null && yeastPct >= 0.35 && yeastPct <= 1.2) {
    checks.push({
      id: 'yeast_artisan_range',
      severity: 'info',
      message: `Yeast ${yeastPct}% of flour fits slow artisan lean doughs (often paired with long cold retard).`
    });
  } else if (yeastPct !== null && yeastPct > 2) {
    checks.push({
      id: 'yeast_high',
      severity: 'warn',
      message: `Yeast ${yeastPct}% of flour is high for lean bread — risk of fast blow-out, yeasty flavor, or collapse if proof is long.`
    });
  }

  if (coldH !== undefined && yeastPct !== null) {
    if (yeastPct < 1 && coldH >= 12) {
      checks.push({
        id: 'cold_retard_matches_yeast',
        severity: 'info',
        message: `Low yeast + ${coldH}h cold retard is consistent with overnight artisan fermentation.`
      });
    }
    if (yeastPct < 0.8 && coldH < 6) {
      checks.push({
        id: 'cold_retard_short_for_yeast',
        severity: 'warn',
        message: `Very low yeast (${yeastPct}%) with only ${coldH}h cold time may under-ferment — expect dense crumb unless room-temp bulk was long.`
      });
    }
    if (yeastPct > 1.5 && coldH > 24) {
      checks.push({
        id: 'over_retard_risk',
        severity: 'warn',
        message: `High yeast (${yeastPct}%) with ${coldH}h+ cold retard risks over-proofing and weak gluten.`
      });
    }
  } else if (
    yeastPct !== null &&
    yeastPct < 0.8 &&
    (style === 'baguette' || style === 'lean_bread' || style === 'sourdough')
  ) {
    checks.push({
      id: 'long_ferment_time_hint',
      severity: 'info',
      message:
        'Low yeast lean/sourdough formulas usually need long bulk and/or cold retard — pass cold_retard_hours when the source recipe specifies it.'
    });
  }

  if (roomH !== undefined && roomH > 0 && roomH < 2 && yeastPct !== null && yeastPct < 0.8) {
    checks.push({
      id: 'short_bulk_low_yeast',
      severity: 'warn',
      message: `Only ~${roomH}h room-temp bulk with ${yeastPct}% yeast may be insufficient before shaping.`
    });
  }

  if (yeastHint === 'active_dry' && hasInstant && !hasActiveDry) {
    checks.push({
      id: 'yeast_type_mismatch',
      severity: 'warn',
      message:
        'Process hints say active dry yeast but the ingredient list matched instant yeast — amounts are not interchangeable gram-for-gram (active dry often ~25% more than instant for same activity).'
    });
  } else if (yeastHint === 'instant' && hasActiveDry && !hasInstant) {
    checks.push({
      id: 'yeast_type_mismatch',
      severity: 'warn',
      message:
        'Process hints say instant yeast but catalog match is active dry — if the source recipe was written for instant, reduce active dry ~25% or proof yeast per package.'
    });
  }

  if (yeastHint === 'fresh' && (hasInstant || hasActiveDry) && !hasFresh) {
    checks.push({
      id: 'yeast_type_fresh_mismatch',
      severity: 'warn',
      message:
        'Process hints say fresh yeast but the list matched dry yeast — fresh is typically ~3× dry yeast by weight for similar activity.'
    });
  } else if (yeastHint === 'instant' && hasFresh && !hasInstant && !hasActiveDry) {
    checks.push({
      id: 'yeast_type_fresh_mismatch',
      severity: 'warn',
      message:
        'Process hints say instant yeast but catalog match is fresh — if the source used instant grams, fresh amount may be ~3× too low.'
    });
  }

  const ddt = hints?.target_dough_temp_c;
  const ambient = hints?.ambient_temp_c;
  if (ddt !== undefined) {
    if (ddt < 22) {
      checks.push({
        id: 'ddt_cold',
        severity: 'info',
        message: `Target dough temp ${ddt}°C is cool — fermentation will be slow unless yeast % is low and time is long.`
      });
    } else if (ddt > 28) {
      checks.push({
        id: 'ddt_warm',
        severity: 'warn',
        message: `Target dough temp ${ddt}°C is warm — risk of fast fermentation and weaker structure if bulk is extended.`
      });
    } else {
      checks.push({
        id: 'ddt_ok',
        severity: 'info',
        message: `Target dough temp ${ddt}°C is in a typical artisan range (~24–26°C).`
      });
    }

    if (ambient !== undefined && ambient > ddt + 3) {
      checks.push({
        id: 'ddt_friction_water',
        severity: 'info',
        message: `Ambient ${ambient}°C is warmer than DDT ${ddt}°C — mixer friction usually heats dough; use colder water or shorter mix to hit DDT.`
      });
    }
    if (ambient !== undefined && ambient < ddt - 5) {
      checks.push({
        id: 'ddt_warm_water',
        severity: 'info',
        message: `Ambient ${ambient}°C is cooler than DDT ${ddt}°C — warmer water may be needed to reach target dough temperature.`
      });
    }
  }

  if (style === 'quick_yeast' && yeastPct !== null && yeastPct < 0.5) {
    checks.push({
      id: 'quick_yeast_low',
      severity: 'warn',
      message: 'Quick yeast-bread style hint conflicts with very low yeast — expect long waits unless warm proofing is used.'
    });
  }

  if (style === 'sandwich_loaf' && yeastPct !== null && yeastPct > 2.5) {
    checks.push({
      id: 'sandwich_yeast_high',
      severity: 'info',
      message: `Yeast ${yeastPct}% is high for sandwich loaf — OK for rapid rise recipes; shorten proof to avoid collapse.`
    });
  }

  if (style === 'rolls' && yeastPct !== null && yeastPct >= 1 && yeastPct <= 2.5) {
    checks.push({
      id: 'rolls_yeast_ok',
      severity: 'info',
      message: `Yeast ${yeastPct}% is typical for dinner rolls and buns.`
    });
  }

  return checks;
}
