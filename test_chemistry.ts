import { ChemistryService } from './src/services/chemistry.service';

// Test data: Simple cake recipe
// Expected: Should detect eggs as liquid source, warn about excessive leavening

const testIngredients = [
  {
    id: "1",
    name: 'All-Purpose Flour',
    category: 'flour',
    water_content_pct: 11.9,
    protein_content_pct: 10.3,
    fat_content_pct: 1.0,
    sugar_content_pct: 0.3,
    starch_content_pct: 72.0,
    ph_level_min: 6.0,
    ph_level_max: 6.5,
    gluten_forming: true,
    leavening_type: null
  },
  {
    id: "2",
    name: 'Large Eggs',
    category: 'egg',
    water_content_pct: 76.0,
    protein_content_pct: 12.6,
    fat_content_pct: 9.5,
    sugar_content_pct: 0.4,
    starch_content_pct: 0.0,
    ph_level_min: 7.0,
    ph_level_max: 7.9,
    gluten_forming: false,
    leavening_type: 'mechanical'
  },
  {
    id: "3",
    name: 'Unsalted Butter',
    category: 'fat',
    water_content_pct: 15.9,
    protein_content_pct: 0.9,
    fat_content_pct: 81.1,
    sugar_content_pct: 0.1,
    starch_content_pct: 0.0,
    ph_level_min: 6.5,
    ph_level_max: 6.8,
    gluten_forming: false,
    leavening_type: null
  },
  {
    id: "4",
    name: 'Baking Powder',
    category: 'leavener',
    water_content_pct: 2.0,
    protein_content_pct: 0.0,
    fat_content_pct: 0.0,
    sugar_content_pct: 0.0,
    starch_content_pct: 28.0,
    ph_level_min: 7.5,
    ph_level_max: 8.5,
    gluten_forming: false,
    leavening_type: 'chemical'
  }
];

console.log('\n=== CHEMISTRY TEST 1: Normal Cake Recipe ===\n');
const test1Inputs = [
  { ingredient_id: "1", quantity_g: 250 },  // 250g flour
  { ingredient_id: "2", quantity_g: 100 },  // 100g eggs (~2 eggs)
  { ingredient_id: "3", quantity_g: 113 },  // 113g butter (1 stick)
  { ingredient_id: "4", quantity_g: 10 }    // 10g baking powder (~4% of flour = normal)
];

const result1 = ChemistryService.analyzeCombination(test1Inputs, testIngredients);
console.log('INPUTS:', test1Inputs);
console.log('\nHYDRATION ANALYSIS:');
console.log(`  Flour weight: ${result1.hydration_analysis.flour_weight_g}g`);
console.log(`  Liquid weight: ${result1.hydration_analysis.liquid_weight_g.toFixed(1)}g`);
console.log(`  Hydration ratio: ${result1.hydration_analysis.hydration_ratio_pct.toFixed(1)}%`);
console.log(`  Assessment: ${result1.hydration_analysis.assessment}`);
console.log(`  Notes: ${result1.hydration_analysis.notes}`);

console.log('\nLEAVENING ANALYSIS:');
console.log(`  Biological: ${result1.leavening_analysis.biological_present}`);
console.log(`  Chemical: ${result1.leavening_analysis.chemical_present}`);
console.log(`  Mechanical: ${result1.leavening_analysis.mechanical_present}`);
console.log(`  Adequacy: ${result1.leavening_analysis.adequacy}`);
console.log(`  Notes: ${result1.leavening_analysis.notes}`);

console.log('\nPREDICTED TEXTURE:', result1.predicted_texture_profile);
console.log('\nPREDICTION:', result1.prediction);
console.log('\nWARNINGS:', result1.warnings.length > 0 ? result1.warnings : ['None']);


console.log('\n\n=== CHEMISTRY TEST 2: Excessive Leavening ===\n');
const test2Inputs = [
  { ingredient_id: "1", quantity_g: 250 },  // 250g flour
  { ingredient_id: "2", quantity_g: 100 },  // 100g eggs
  { ingredient_id: "3", quantity_g: 113 },  // 113g butter
  { ingredient_id: "4", quantity_g: 100 }   // 100g baking powder (40% of flour = EXCESSIVE!)
];

const result2 = ChemistryService.analyzeCombination(test2Inputs, testIngredients);
console.log('INPUTS:', test2Inputs);
console.log('\nLEAVENING ANALYSIS:');
console.log(`  Chemical: ${result2.leavening_analysis.chemical_present}`);
console.log(`  Adequacy: ${result2.leavening_analysis.adequacy}`);
console.log(`  Notes: ${result2.leavening_analysis.notes}`);
console.log('\nWARNINGS:', result2.warnings);


console.log('\n\n=== CHEMISTRY TEST 3: No Liquid (Should Warn) ===\n');
const test3Inputs = [
  { ingredient_id: "1", quantity_g: 250 },  // 250g flour
  { ingredient_id: "4", quantity_g: 10 }    // 10g baking powder (no eggs, no liquid!)
];

const result3 = ChemistryService.analyzeCombination(test3Inputs, testIngredients);
console.log('INPUTS:', test3Inputs);
console.log('\nHYDRATION:');
console.log(`  Liquid weight: ${result3.hydration_analysis.liquid_weight_g.toFixed(1)}g`);
console.log(`  Hydration ratio: ${result3.hydration_analysis.hydration_ratio_pct.toFixed(1)}%`);
console.log(`  Assessment: ${result3.hydration_analysis.assessment}`);
console.log('\nPREDICTED TEXTURE:', result3.predicted_texture_profile);
console.log('  (Should NOT include "airy" with 0% hydration)');
console.log('\nWARNINGS:', result3.warnings);


console.log('\n\n=== EXPECTED vs ACTUAL Liquid Calculation ===');
console.log('Test 1 (cake): 100g eggs + 113g butter');
console.log('  Expected: 100g × 76% + 113g × 15.9% = 76g + 18g = 94g');
console.log('  Actual:', result1.hydration_analysis.liquid_weight_g.toFixed(1) + 'g');
console.log('  Match?', Math.abs(result1.hydration_analysis.liquid_weight_g - 94) < 1 ? '✅ YES' : '❌ NO');
