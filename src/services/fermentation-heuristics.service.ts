import { DoughMetrics, ValidationCheck } from './mix-validation.service';

export type YeastTypeHint = 'instant' | 'active_dry' | 'fresh' | 'unknown';

export interface FermentationProcessHints {
  yeast_type?: YeastTypeHint;
  cold_retard_hours?: number;
  room_temp_bulk_hours?: number;
  style?: 'baguette' | 'sandwich_loaf' | 'quick' | 'unknown';
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
  if (yeastPct === null || metrics.flour_weight_g < 50) {
    return checks;
  }

  const style = hints?.style ?? 'unknown';
  const coldH = hints?.cold_retard_hours;
  const roomH = hints?.room_temp_bulk_hours;
  const yeastHint = hints?.yeast_type ?? 'unknown';

  const catalogYeast = yeastCatalogNames.map((n) => n.toLowerCase());
  const hasInstant = catalogYeast.some((n) => n.includes('instant'));
  const hasActiveDry = catalogYeast.some((n) => n.includes('active dry'));

  if (yeastPct >= 0.35 && yeastPct <= 1.2) {
    checks.push({
      id: 'yeast_artisan_range',
      severity: 'info',
      message: `Yeast ${yeastPct}% of flour fits slow artisan lean doughs (often paired with long cold retard).`
    });
  } else if (yeastPct > 2) {
    checks.push({
      id: 'yeast_high',
      severity: 'warn',
      message: `Yeast ${yeastPct}% of flour is high for lean bread — risk of fast blow-out, yeasty flavor, or collapse if proof is long.`
    });
  }

  if (coldH !== undefined) {
    if (yeastPct < 1 && coldH >= 12) {
      checks.push({
        id: 'cold_retard_matches_yeast',
        severity: 'info',
        message: `Low yeast + ${coldH}h cold retard is consistent with overnight artisan fermentation (e.g. baguette-style).`
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
  } else if (yeastPct < 0.8 && style === 'baguette') {
    checks.push({
      id: 'baguette_needs_time',
      severity: 'info',
      message:
        'Low yeast baguette formulas usually need substantial bulk + cold retard (often 12–24h fridge) — pass cold_retard_hours in process hints when known.'
    });
  }

  if (roomH !== undefined && roomH > 0 && roomH < 2 && yeastPct < 0.8) {
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

  if (style === 'quick' && yeastPct < 0.5) {
    checks.push({
      id: 'quick_style_low_yeast',
      severity: 'warn',
      message: 'Quick-bread style hint conflicts with very low yeast — expect long waits unless recipe uses warm proofing.'
    });
  }

  return checks;
}
