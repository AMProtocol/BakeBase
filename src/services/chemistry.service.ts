import { Ingredient } from '@prisma/client';
import { IngredientInput, CombinedAnalysis } from '../types';

export class ChemistryService {
  /**
   * Analyze a combination of ingredients and predict baking outcome
   */
  static analyzeCombination(
    inputs: IngredientInput[],
    ingredients: Ingredient[]
  ): CombinedAnalysis {
    const totalWeight = inputs.reduce((sum, input) => sum + input.quantity_g, 0);

    // Create ingredient map for easy lookup
    const ingredientMap = new Map(ingredients.map(ing => [ing.id, ing]));

    // Calculate weighted averages and totals
    let totalWater = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalSugar = 0;
    let totalStarch = 0;
    let minPH: number | null = null;
    let maxPH: number | null = null;

    // Track specific ingredient types
    let flourWeight = 0;
    let liquidWeight = 0;
    const leaveners = { biological: false, chemical: false, mechanical: false };
    const ingredients_used: Array<{ name: string; quantity_g: number; percentage_of_total: number }> = [];

    // Process each ingredient
    inputs.forEach(input => {
      const ingredient = ingredientMap.get(input.ingredient_id);
      if (!ingredient) return;

      const weight = input.quantity_g;
      const fraction = weight / 100; // per 100g

      // Accumulate nutritional composition
      totalWater += (ingredient.water_content_pct || 0) * fraction;
      totalProtein += (ingredient.protein_content_pct || 0) * fraction;
      totalFat += (ingredient.fat_content_pct || 0) * fraction;
      totalSugar += (ingredient.sugar_content_pct || 0) * fraction;
      totalStarch += (ingredient.starch_content_pct || 0) * fraction;

      // Track pH range
      if (ingredient.ph_level_min !== null) {
        minPH = minPH === null ? ingredient.ph_level_min : Math.min(minPH, ingredient.ph_level_min);
      }
      if (ingredient.ph_level_max !== null) {
        maxPH = maxPH === null ? ingredient.ph_level_max : Math.max(maxPH, ingredient.ph_level_max);
      }

      // Classify ingredients
      if (ingredient.category === 'flour' || ingredient.gluten_forming) {
        flourWeight += weight;
      }

      // Liquids include: eggs (76% water), water itself, milk, etc.
      if ((ingredient.water_content_pct || 0) > 70) {
        liquidWeight += weight * ((ingredient.water_content_pct || 0) / 100);
      }

      // Track leavening types
      if (ingredient.leavening_type) {
        if (ingredient.leavening_type === 'biological') leaveners.biological = true;
        if (ingredient.leavening_type === 'chemical') leaveners.chemical = true;
        if (ingredient.leavening_type === 'mechanical' || ingredient.leavening_type === 'steam') {
          leaveners.mechanical = true;
        }
      }

      // Track ingredients used
      ingredients_used.push({
        name: ingredient.name,
        quantity_g: weight,
        percentage_of_total: (weight / totalWeight) * 100
      });
    });

    // Hydration analysis
    const hydrationRatio = flourWeight > 0 ? (liquidWeight / flourWeight) * 100 : 0;
    let hydrationAssessment: 'dry' | 'low' | 'normal' | 'high' | 'very_high' | 'batter' = 'normal';
    let hydrationNotes = '';

    if (hydrationRatio === 0) {
      hydrationAssessment = 'dry';
      hydrationNotes = 'No flour detected or no liquid added.';
    } else if (hydrationRatio < 50) {
      hydrationAssessment = 'dry';
      hydrationNotes = 'Very low hydration, suitable for pie dough or shortbread.';
    } else if (hydrationRatio < 60) {
      hydrationAssessment = 'low';
      hydrationNotes = 'Low hydration, suitable for bagels or stiff doughs.';
    } else if (hydrationRatio >= 60 && hydrationRatio < 70) {
      hydrationAssessment = 'normal';
      hydrationNotes = 'Normal bread dough hydration, suitable for most yeasted breads.';
    } else if (hydrationRatio >= 70 && hydrationRatio < 100) {
      hydrationAssessment = 'high';
      hydrationNotes = 'High hydration, suitable for ciabatta, focaccia, or artisan breads.';
    } else if (hydrationRatio >= 100 && hydrationRatio < 150) {
      hydrationAssessment = 'very_high';
      hydrationNotes = 'Very high hydration, creates wet dough or thick batter.';
    } else {
      hydrationAssessment = 'batter';
      hydrationNotes = 'Batter consistency, suitable for cakes, pancakes, or quick breads.';
    }

    // Leavening adequacy assessment
    let leaveningAdequacy: 'none' | 'insufficient' | 'adequate' | 'excessive' = 'none';
    let leaveningNotes = '';

    const hasLeavening = leaveners.biological || leaveners.chemical || leaveners.mechanical;

    if (!hasLeavening) {
      leaveningAdequacy = 'none';
      leaveningNotes = 'No leavening detected. Product will be dense (flatbread, unleavened bread, or must rely on eggs/steam).';
    } else {
      // Simple heuristic: biological or chemical leavening present = adequate for now
      // More sophisticated: check actual quantities
      leaveningAdequacy = 'adequate';
      const types: string[] = [];
      if (leaveners.biological) types.push('biological (yeast)');
      if (leaveners.chemical) types.push('chemical (baking powder/soda)');
      if (leaveners.mechanical) types.push('mechanical (whipped eggs/steam)');
      leaveningNotes = `Leavening present: ${types.join(', ')}.`;
    }

    // Protein interaction summary
    let proteinSummary = '';
    const avgProteinPct = totalProtein;

    if (avgProteinPct < 5) {
      proteinSummary = 'Very low protein content; minimal structure. Relies on starch, fat, or eggs for texture.';
    } else if (avgProteinPct < 10) {
      proteinSummary = 'Low protein content; tender, delicate crumb. Limited gluten development.';
    } else if (avgProteinPct < 13) {
      proteinSummary = 'Moderate protein content; balanced structure. Good gluten development for bread or cakes.';
    } else {
      proteinSummary = 'High protein content; strong gluten network. Produces chewy, elastic texture.';
    }

    // Predicted texture
    const textureProfile: string[] = [];

    if (totalFat > 15) textureProfile.push('rich');
    if (totalFat > 25) textureProfile.push('tender');
    if (avgProteinPct > 12 && flourWeight > 0) textureProfile.push('chewy');
    if (avgProteinPct < 8) textureProfile.push('delicate');
    if (hydrationRatio > 100) textureProfile.push('moist');
    if (hydrationRatio < 60) textureProfile.push('crumbly');
    if (totalSugar > 20) textureProfile.push('sweet');
    if (hasLeavening) textureProfile.push('airy');
    if (!hasLeavening && flourWeight > 0) textureProfile.push('dense');

    // pH environment
    let phEnv = 'neutral';
    if (minPH !== null && maxPH !== null) {
      const avgPH = (minPH + maxPH) / 2;
      if (avgPH < 5.5) phEnv = 'acidic';
      else if (avgPH > 7.5) phEnv = 'alkaline';
      else phEnv = 'neutral';
    }

    const phEnvironment = minPH !== null && maxPH !== null
      ? `pH range ${minPH.toFixed(1)}-${maxPH.toFixed(1)} (${phEnv}). ${
          phEnv === 'acidic'
            ? 'Acidic environment enhances baking soda leavening, may tenderize gluten slightly.'
            : phEnv === 'alkaline'
            ? 'Alkaline environment accelerates browning (Maillard reaction), may weaken gluten.'
            : 'Neutral pH, standard baking environment.'
        }`
      : 'pH data not available for all ingredients.';

    // Generate plain-language prediction
    const prediction = this.generatePrediction({
      hydrationAssessment,
      hydrationRatio,
      flourWeight,
      totalWeight,
      hasLeavening,
      leaveners,
      avgProteinPct,
      totalFat,
      totalSugar,
      phEnv,
      textureProfile,
      ingredients_used
    });

    // Generate warnings
    const warnings: string[] = [];

    if (flourWeight > 0 && hydrationRatio < 40) {
      warnings.push('Very low hydration may result in dry, crumbly texture. Consider adding more liquid.');
    }
    if (flourWeight > 0 && hydrationRatio > 200) {
      warnings.push('Extremely high hydration ratio. This will be a very thin batter.');
    }
    if (flourWeight > 0 && !hasLeavening && totalWeight > 200) {
      warnings.push('No leavening agent detected for a substantial amount of flour. Product will be very dense unless eggs provide structure and lift.');
    }
    if (totalSugar > 50) {
      warnings.push('Very high sugar content may inhibit gluten development and slow yeast fermentation if present.');
    }

    return {
      total_weight_g: totalWeight,
      total_hydration_pct: totalWater,
      total_protein_pct: totalProtein,
      total_fat_pct: totalFat,
      total_sugar_pct: totalSugar,
      total_starch_pct: totalStarch,
      ph_range: {
        min: minPH ?? 7.0,
        max: maxPH ?? 7.0
      },
      leavening_analysis: {
        biological_present: leaveners.biological,
        chemical_present: leaveners.chemical,
        mechanical_present: leaveners.mechanical,
        adequacy: leaveningAdequacy,
        notes: leaveningNotes
      },
      hydration_analysis: {
        flour_weight_g: flourWeight,
        liquid_weight_g: liquidWeight,
        hydration_ratio_pct: hydrationRatio,
        assessment: hydrationAssessment,
        notes: hydrationNotes
      },
      protein_interaction_summary: proteinSummary,
      predicted_texture_profile: textureProfile,
      ph_environment: phEnvironment,
      prediction,
      warnings,
      ingredients_used
    };
  }

  private static generatePrediction(context: {
    hydrationAssessment: string;
    hydrationRatio: number;
    flourWeight: number;
    totalWeight: number;
    hasLeavening: boolean;
    leaveners: { biological: boolean; chemical: boolean; mechanical: boolean };
    avgProteinPct: number;
    totalFat: number;
    totalSugar: number;
    phEnv: string;
    textureProfile: string[];
    ingredients_used: Array<{ name: string; quantity_g: number; percentage_of_total: number }>;
  }): string {
    const {
      hydrationAssessment,
      hydrationRatio,
      flourWeight,
      totalWeight,
      hasLeavening,
      leaveners,
      avgProteinPct,
      totalFat,
      totalSugar,
      phEnv,
      textureProfile,
      ingredients_used
    } = context;

    let prediction = '';

    // Determine bake type
    if (flourWeight === 0) {
      prediction = `This mixture contains no flour, suggesting a flourless preparation. `;
      prediction += `With ${totalWeight}g total weight, this could be a custard, mousse, or flourless cake depending on other ingredients. `;
    } else if (hydrationRatio > 150) {
      prediction = `This is a high-hydration batter (${hydrationRatio.toFixed(0)}% hydration ratio). `;
      prediction += `Expected outcome: ${
        hasLeavening
          ? 'Light, tender cake or quick bread with open crumb structure.'
          : 'Dense, moist quick bread or cake. Without leavening, this will be compact and heavy, similar to a moist pound cake or quick bread.'
      } `;
    } else if (hydrationRatio >= 100 && hydrationRatio <= 150) {
      prediction = `This is a thick batter or very wet dough (${hydrationRatio.toFixed(0)}% hydration). `;
      prediction += `Expected outcome: Moist, tender crumb. ${
        hasLeavening
          ? 'Should produce a soft, cake-like texture with moderate rise.'
          : 'Will be dense and compact without added leavening. Consider adding baking powder, baking soda, or whipped eggs for lift.'
      } `;
    } else if (hydrationRatio >= 60 && hydrationRatio < 100) {
      prediction = `This is a workable dough (${hydrationRatio.toFixed(0)}% hydration). `;
      if (leaveners.biological) {
        prediction += `With yeast present, this will produce a classic bread with chewy texture and moderate crumb. `;
      } else if (leaveners.chemical) {
        prediction += `Chemical leavening will create a biscuit or scone-like texture. `;
      } else {
        prediction += `Without leavening, this will be a dense flatbread or unleavened product. `;
      }
    } else {
      prediction = `This is a low-hydration dough (${hydrationRatio.toFixed(0)}% hydration). `;
      prediction += `Expected outcome: Crumbly, short texture suitable for pie crust, shortbread, or cookies. `;
    }

    // Add protein context
    if (avgProteinPct > 12 && flourWeight > 0) {
      prediction += `High protein content will create a strong gluten network, resulting in chewy, elastic texture. `;
    } else if (avgProteinPct < 8 && flourWeight > 0) {
      prediction += `Low protein content will produce a tender, delicate crumb with minimal chewiness. `;
    }

    // Add fat context
    if (totalFat > 20) {
      prediction += `High fat content will tenderize the structure and create a rich mouthfeel. `;
    }

    // Add sugar context
    if (totalSugar > 30) {
      prediction += `High sugar content will tenderize, retain moisture, and promote browning. `;
    }

    // Add pH context
    if (phEnv === 'acidic') {
      prediction += `The acidic pH environment (from ingredients like buttermilk, molasses, or citrus) will enhance chemical leavening if baking soda is present, and may slightly tenderize gluten. `;
    } else if (phEnv === 'alkaline') {
      prediction += `The alkaline environment will accelerate browning (darker color) and may produce a slightly soapy taste if baking soda is not properly neutralized by acid. `;
    }

    // Add leavening context
    if (!hasLeavening && flourWeight > 50) {
      prediction += `⚠️ CRITICAL: No leavening agent detected. This mixture will produce a very dense, flat result unless mechanical leavening (whipped eggs) or steam provides lift. Consider adding baking powder (1-2 tsp per cup flour) or baking soda (1/4 tsp per cup flour with acid). `;
    }

    // Texture summary
    if (textureProfile.length > 0) {
      prediction += `Overall predicted texture: ${textureProfile.join(', ')}.`;
    }

    return prediction.trim();
  }
}
