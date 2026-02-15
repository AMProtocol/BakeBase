import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.ingredient.deleteMany();

  // FLOURS
  const flours = [
    {
      name: 'All-Purpose Flour',
      category: 'flour',
      description: 'Versatile wheat flour with moderate protein content, suitable for most baking applications.',
      water_content_pct: 11.9,
      protein_content_pct: 10.3,
      fat_content_pct: 0.98,
      starch_content_pct: 72.5,
      sugar_content_pct: 0.3,
      fiber_content_pct: 2.7,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.593,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.6,
      flavor_profile: ['neutral', 'slightly sweet', 'wheaty'],
      primary_function: 'Provides structure through gluten development and starch gelatinization.',
      interactions: [
        { ingredient: 'water', effect: 'Forms gluten network when hydrated and mixed', notes: 'Requires kneading or mixing to develop gluten' },
        { ingredient: 'fat', effect: 'Tenderizes by coating gluten strands', notes: 'Reduces gluten development, creates tender crumb' },
        { ingredient: 'acid', effect: 'Weakens gluten structure slightly', notes: 'Can reduce chewiness' },
        { ingredient: 'sugar', effect: 'Competes for water, slows gluten development', notes: 'Higher sugar ratios produce more tender results' }
      ],
      substitution_ratio: [
        { substitute: 'bread flour', ratio: '1:1', notes: 'Will produce slightly chewier texture due to higher protein' },
        { substitute: 'cake flour', ratio: '1:1 minus 2 tbsp per cup', notes: 'Lower protein, more delicate structure' },
        { substitute: 'whole wheat flour', ratio: '1:0.75', notes: 'Use 75% whole wheat to all-purpose, add more liquid' }
      ],
      temperature_sensitivity: 'Starch gelatinizes at 140-158°F (60-70°C), proteins denature at 140-165°F (60-74°C), gluten sets permanently above 180°F (82°C).',
      source_notes: 'USDA FoodData Central (FDC ID: 169756), On Food and Cooking by Harold McGee',
      confidence_level: 'verified'
    },
    {
      name: 'Bread Flour',
      category: 'flour',
      description: 'High-protein wheat flour that produces strong gluten networks, ideal for yeast breads.',
      water_content_pct: 11.4,
      protein_content_pct: 12.6,
      fat_content_pct: 1.7,
      starch_content_pct: 70.0,
      sugar_content_pct: 0.4,
      fiber_content_pct: 2.4,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.593,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.65,
      flavor_profile: ['neutral', 'wheaty'],
      primary_function: 'Creates strong elastic gluten structure capable of trapping gas for high-rise breads.',
      interactions: [
        { ingredient: 'water', effect: 'Absorbs more water than all-purpose due to higher protein', notes: 'Requires higher hydration for optimal dough consistency' },
        { ingredient: 'yeast', effect: 'Strong gluten traps CO2 efficiently', notes: 'Produces superior oven spring' },
        { ingredient: 'salt', effect: 'Strengthens gluten, slows fermentation', notes: 'Essential for flavor and gluten control' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1:1', notes: 'Results in slightly less chewy, lower-rise bread' },
        { substitute: 'vital wheat gluten + all-purpose', ratio: '1 tbsp gluten per cup all-purpose', notes: 'Approximates bread flour protein content' }
      ],
      temperature_sensitivity: 'Similar to all-purpose but stronger gluten can withstand more mechanical and thermal stress. Gluten fully sets at 180°F (82°C).',
      source_notes: 'USDA FoodData Central, Bread Science by Emily Buehler',
      confidence_level: 'verified'
    },
    {
      name: 'Cake Flour',
      category: 'flour',
      description: 'Low-protein, finely milled wheat flour that produces tender, delicate cakes with fine crumb.',
      water_content_pct: 12.0,
      protein_content_pct: 7.5,
      fat_content_pct: 0.9,
      starch_content_pct: 76.0,
      sugar_content_pct: 0.4,
      fiber_content_pct: 1.2,
      ph_level_min: 4.5,
      ph_level_max: 5.0,
      density_g_per_ml: 0.528,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.55,
      flavor_profile: ['neutral', 'delicate'],
      primary_function: 'Produces minimal gluten for tender, fine-crumbed cakes with soft texture.',
      interactions: [
        { ingredient: 'sugar', effect: 'High sugar content interferes with already-weak gluten', notes: 'Perfect for high-ratio cakes' },
        { ingredient: 'baking powder', effect: 'Chemically leavened batters ideal for low-protein flour', notes: 'Creates lift without strong gluten structure' },
        { ingredient: 'liquid', effect: 'Absorbs less liquid than higher-protein flours', notes: 'Adjust recipes accordingly' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1 cup minus 2 tbsp all-purpose', notes: 'Remove 2 tbsp per cup and sift 4-5 times' },
        { substitute: 'all-purpose + cornstarch', ratio: '2 tbsp cornstarch + 14 tbsp all-purpose per cup', notes: 'Dilutes protein content' }
      ],
      temperature_sensitivity: 'Lower protein means less structural support; relies on starch gelatinization (140-158°F) and egg coagulation. Often chlorinated, which lowers pH and improves cake structure.',
      source_notes: 'USDA FoodData Central, How Baking Works by Paula Figoni',
      confidence_level: 'verified'
    },
    {
      name: 'Pastry Flour',
      category: 'flour',
      description: 'Medium-low protein flour, between cake and all-purpose, ideal for tender pastries and biscuits.',
      water_content_pct: 11.8,
      protein_content_pct: 9.0,
      fat_content_pct: 1.0,
      starch_content_pct: 74.0,
      sugar_content_pct: 0.3,
      fiber_content_pct: 2.0,
      ph_level_min: 5.5,
      ph_level_max: 6.0,
      density_g_per_ml: 0.560,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.58,
      flavor_profile: ['neutral', 'delicate'],
      primary_function: 'Balances tenderness with enough structure for flaky pastries and biscuits.',
      interactions: [
        { ingredient: 'fat', effect: 'Fat layering creates flakiness without tough gluten', notes: 'Ideal for laminated doughs' },
        { ingredient: 'cold water', effect: 'Minimal mixing keeps gluten development low', notes: 'Critical for tender pie crusts' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1:1', notes: 'Slightly less tender result' },
        { substitute: '2 parts all-purpose + 1 part cake flour', ratio: '2:1 blend', notes: 'Approximates pastry flour protein' }
      ],
      temperature_sensitivity: 'Similar to all-purpose but produces more tender results due to lower protein. Starch gelatinization provides structure in absence of strong gluten.',
      source_notes: 'Professional Baking by Wayne Gisslen, baker consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Whole Wheat Flour',
      category: 'flour',
      description: 'Flour milled from entire wheat kernel including bran and germ, with nutty flavor and higher fiber.',
      water_content_pct: 10.7,
      protein_content_pct: 13.2,
      fat_content_pct: 2.5,
      starch_content_pct: 61.8,
      sugar_content_pct: 0.4,
      fiber_content_pct: 10.7,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.480,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.75,
      flavor_profile: ['nutty', 'earthy', 'wheaty', 'slightly bitter'],
      primary_function: 'Provides whole grain nutrition, nutty flavor, and denser structure than white flour.',
      interactions: [
        { ingredient: 'water', effect: 'Bran and germ absorb significantly more water', notes: 'Requires 10-20% more hydration than white flour' },
        { ingredient: 'gluten', effect: 'Bran physically cuts gluten strands', notes: 'Produces denser, less elastic dough' },
        { ingredient: 'time', effect: 'Benefits from autolyse to soften bran', notes: '20-30 minute rest improves texture' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '0.75:1', notes: 'Use 75% whole wheat, increase liquid by 2 tbsp per cup' },
        { substitute: 'white whole wheat flour', ratio: '1:1', notes: 'Milder flavor, similar nutrition' }
      ],
      temperature_sensitivity: 'Similar gelatinization to white flour but bran and germ add structure. Fat in germ can go rancid at room temperature; store refrigerated.',
      source_notes: 'USDA FoodData Central (FDC ID: 168937), Whole Grain Baking by King Arthur',
      confidence_level: 'verified'
    },
    {
      name: 'Rye Flour',
      category: 'flour',
      description: 'Flour milled from rye grain with low gluten-forming ability but high pentosan content.',
      water_content_pct: 10.6,
      protein_content_pct: 10.4,
      fat_content_pct: 1.6,
      starch_content_pct: 68.7,
      sugar_content_pct: 0.9,
      fiber_content_pct: 15.1,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.528,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.8,
      flavor_profile: ['earthy', 'sour', 'complex', 'tangy'],
      primary_function: 'Provides distinctive sour flavor and gummy texture via pentosans rather than gluten.',
      interactions: [
        { ingredient: 'water', effect: 'Pentosans absorb massive amounts of water, form viscous gel', notes: 'Creates sticky, extensible dough' },
        { ingredient: 'acid', effect: 'Sourdough culture essential for flavor and structure', notes: 'Acid helps set pentosan gel' },
        { ingredient: 'wheat flour', effect: 'Usually blended with wheat for structural support', notes: 'Pure rye bread is extremely dense' }
      ],
      substitution_ratio: [
        { substitute: 'whole wheat flour', ratio: '1:1', notes: 'Different flavor profile, better structure but loses rye character' }
      ],
      temperature_sensitivity: 'Pentosans gelatinize and form sticky network. Lower protein means less oven spring. Amylase stays active longer, requires longer bake or acid to control.',
      source_notes: 'USDA FoodData Central (FDC ID: 168928), The Rye Baker by Stanley Ginsberg',
      confidence_level: 'verified'
    },
    {
      name: 'Almond Flour',
      category: 'flour',
      description: 'Finely ground blanched almonds, gluten-free and high in fat, used for tender baked goods.',
      water_content_pct: 4.7,
      protein_content_pct: 21.2,
      fat_content_pct: 50.6,
      starch_content_pct: 5.0,
      sugar_content_pct: 4.4,
      fiber_content_pct: 10.4,
      ph_level_min: 6.0,
      ph_level_max: 6.8,
      density_g_per_ml: 0.400,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: 0.25,
      flavor_profile: ['nutty', 'sweet', 'rich', 'buttery'],
      primary_function: 'Provides rich flavor, moisture, and tender texture without gluten structure.',
      interactions: [
        { ingredient: 'eggs', effect: 'Eggs provide all structural support in gluten-free baking', notes: 'High egg-to-flour ratio needed' },
        { ingredient: 'leavening', effect: 'Requires generous chemical leavening', notes: 'No gluten to trap gas' },
        { ingredient: 'liquid', effect: 'Absorbs minimal liquid due to high fat content', notes: 'Recipes need much less liquid than wheat flour' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1:1.25', notes: 'Cannot substitute 1:1; requires recipe reformulation' }
      ],
      temperature_sensitivity: 'High fat content means low moisture tolerance and quick browning. Burns easily above 325°F (163°C). Store refrigerated as oils can oxidize.',
      source_notes: 'USDA FoodData Central (FDC ID: 170567), Against All Grain by Danielle Walker',
      confidence_level: 'verified'
    },
    {
      name: 'Rice Flour',
      category: 'flour',
      description: 'Finely milled white or brown rice, gluten-free with neutral flavor and crisp texture.',
      water_content_pct: 11.6,
      protein_content_pct: 6.0,
      fat_content_pct: 1.4,
      starch_content_pct: 79.0,
      sugar_content_pct: 0.1,
      fiber_content_pct: 2.4,
      ph_level_min: 6.0,
      ph_level_max: 6.8,
      density_g_per_ml: 0.640,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: 0.7,
      flavor_profile: ['neutral', 'slightly sweet'],
      primary_function: 'Creates crisp, delicate texture in gluten-free baking and coating applications.',
      interactions: [
        { ingredient: 'xanthan gum', effect: 'Requires binding agent for cohesion', notes: '1/2 tsp per cup flour' },
        { ingredient: 'liquid', effect: 'Forms gritty batter without proper hydration', notes: 'Let batters rest 30 minutes' },
        { ingredient: 'eggs', effect: 'Provides structure lacking in gluten-free flour', notes: 'Essential binding' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: 'Not recommended', notes: 'Completely different behavior; recipe reformulation required' }
      ],
      temperature_sensitivity: 'Very high starch content gelatinizes normally but provides no elastic structure. Creates crisp texture when fried or baked dry. Excellent for tempura and shortbread.',
      source_notes: 'USDA FoodData Central (FDC ID: 168880), Gluten-Free Baking by Rebecca Reilly',
      confidence_level: 'verified'
    },
    {
      name: 'Oat Flour',
      category: 'flour',
      description: 'Ground oats, gluten-free (if certified) with mild sweet flavor and tender, chewy texture.',
      water_content_pct: 8.2,
      protein_content_pct: 13.2,
      fat_content_pct: 7.5,
      starch_content_pct: 57.0,
      sugar_content_pct: 0.8,
      fiber_content_pct: 10.1,
      ph_level_min: 6.0,
      ph_level_max: 6.5,
      density_g_per_ml: 0.400,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.9,
      flavor_profile: ['mild', 'nutty', 'slightly sweet', 'oaty'],
      primary_function: 'Provides tender crumb, moisture retention, and wholesome flavor without gluten.',
      interactions: [
        { ingredient: 'water', effect: 'Absorbs significant liquid due to beta-glucan fiber', notes: 'Creates soft, moist crumb' },
        { ingredient: 'eggs', effect: 'Needed for binding in absence of gluten', notes: 'Structural support' },
        { ingredient: 'baking powder', effect: 'Benefits from extra leavening', notes: 'No gluten to trap gas' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1:1.3', notes: 'Use 30% more oat flour by volume, or reformulate recipe' }
      ],
      temperature_sensitivity: 'Beta-glucan creates viscosity when heated. High fiber and fat content keep baked goods moist longer. Avoid over-mixing to prevent gumminess.',
      source_notes: 'USDA FoodData Central (FDC ID: 173904), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Semolina Flour',
      category: 'flour',
      description: 'Coarsely ground durum wheat, high protein and golden color, ideal for pasta and rustic breads.',
      water_content_pct: 12.7,
      protein_content_pct: 12.7,
      fat_content_pct: 1.1,
      starch_content_pct: 70.1,
      sugar_content_pct: 0.6,
      fiber_content_pct: 3.2,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.690,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: 0.6,
      flavor_profile: ['sweet', 'wheaty', 'rich', 'buttery'],
      primary_function: 'Creates firm, elastic dough with golden color, ideal for pasta and chewy breads.',
      interactions: [
        { ingredient: 'water', effect: 'Coarse grind absorbs water slowly', notes: 'Requires longer kneading and resting' },
        { ingredient: 'eggs', effect: 'Traditional pasta uses semolina + eggs', notes: 'Rich, golden pasta dough' },
        { ingredient: 'olive oil', effect: 'Common in Italian breads with semolina', notes: 'Enhances golden color and flavor' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1:1', notes: 'Loses golden color and some chewiness' },
        { substitute: 'bread flour', ratio: '1:1', notes: 'Better texture match than all-purpose' }
      ],
      temperature_sensitivity: 'High protein creates strong gluten. Yellow pigments (carotenoids) provide color. Coarse texture creates al dente bite in pasta. Similar thermal properties to bread flour.',
      source_notes: 'USDA FoodData Central (FDC ID: 168932), Pasta Making by Evan Funke',
      confidence_level: 'verified'
    }
  ];

  // EGGS
  const eggs = [
    {
      name: 'Whole Egg',
      category: 'egg',
      description: 'Complete chicken egg containing both white and yolk, providing structure, moisture, leavening, and emulsification.',
      water_content_pct: 76.0,
      protein_content_pct: 12.6,
      fat_content_pct: 9.5,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.4,
      fiber_content_pct: 0.0,
      ph_level_min: 7.0,
      ph_level_max: 7.9,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: 'mechanical',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'rich', 'eggy'],
      primary_function: 'Provides structure via protein coagulation, emulsification via lecithin, moisture, and color.',
      interactions: [
        { ingredient: 'sugar', effect: 'Sugar delays protein coagulation, tenderizes', notes: 'Higher temperature needed for setting' },
        { ingredient: 'acid', effect: 'Acid speeds coagulation, can curdle if too strong', notes: 'Lemon juice in custards sets faster' },
        { ingredient: 'heat', effect: 'Proteins coagulate 144-158°F (62-70°C)', notes: 'Overcooking causes rubbery texture' },
        { ingredient: 'air', effect: 'Whole eggs can be whipped to foam with sugar', notes: 'Less stable than egg white foam alone' }
      ],
      substitution_ratio: [
        { substitute: 'flax egg', ratio: '1 tbsp ground flax + 3 tbsp water per egg', notes: 'Binding only, no leavening or richness' },
        { substitute: 'applesauce', ratio: '1/4 cup per egg', notes: 'Moisture and binding, no structure' },
        { substitute: 'commercial egg replacer', ratio: 'Follow package directions', notes: 'Varies by brand' }
      ],
      temperature_sensitivity: 'Egg white proteins begin denaturing at 144°F (62°C), yolk at 149°F (65°C). Fully set at 158°F (70°C). Overcooking above 180°F (82°C) produces sulfur off-flavors (H2S) and rubbery texture.',
      source_notes: 'USDA FoodData Central (FDC ID: 748967), On Food and Cooking by Harold McGee, average large egg = 50g',
      confidence_level: 'verified'
    },
    {
      name: 'Egg Yolk',
      category: 'egg',
      description: 'Yellow center of egg, rich in fat and lecithin, primary emulsifier and source of richness.',
      water_content_pct: 48.8,
      protein_content_pct: 15.9,
      fat_content_pct: 26.5,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.6,
      fiber_content_pct: 0.0,
      ph_level_min: 6.0,
      ph_level_max: 6.4,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['rich', 'creamy', 'buttery'],
      primary_function: 'Emulsifies fat and water, adds richness, color, and tender texture via fat content.',
      interactions: [
        { ingredient: 'fat', effect: 'Lecithin in yolk emulsifies fats into water', notes: 'Essential for mayonnaise, hollandaise, ice cream' },
        { ingredient: 'sugar', effect: 'Yolks and sugar create ribbon stage when whipped', notes: 'Foundation of sabayon, genoise' },
        { ingredient: 'acid', effect: 'Acid helps stabilize emulsions', notes: 'Lemon juice or vinegar in mayonnaise' },
        { ingredient: 'heat', effect: 'Coagulates 149-158°F (65-70°C)', notes: 'Higher temperature than whites' }
      ],
      substitution_ratio: [
        { substitute: 'whole egg', ratio: '1 whole egg = ~3 yolks for richness', notes: 'Lose emulsification power' },
        { substitute: 'lecithin powder + oil', ratio: '1 tbsp oil + 1/4 tsp lecithin per yolk', notes: 'Emulsification only' }
      ],
      temperature_sensitivity: 'Yolk proteins coagulate at 149°F (65°C), higher than whites. Full set at 158°F (70°C). Contains iron that reacts with sulfur from whites at high heat, creating green ring in hard-boiled eggs.',
      source_notes: 'USDA FoodData Central (FDC ID: 172183), Modernist Cuisine, average large yolk = 17g',
      confidence_level: 'verified'
    },
    {
      name: 'Egg White',
      category: 'egg',
      description: 'Clear albumen surrounding yolk, pure protein that creates stable foams and provides structure.',
      water_content_pct: 87.6,
      protein_content_pct: 10.9,
      fat_content_pct: 0.2,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.7,
      fiber_content_pct: 0.0,
      ph_level_min: 7.6,
      ph_level_max: 8.5,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'mechanical',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'clean'],
      primary_function: 'Creates stable foam when whipped, provides structure through protein coagulation, clarifies liquids.',
      interactions: [
        { ingredient: 'acid', effect: 'Stabilizes foam, lowers pH for tighter protein network', notes: 'Cream of tartar in meringue' },
        { ingredient: 'sugar', effect: 'Stabilizes foam but slows whipping', notes: 'Add gradually for stable meringue' },
        { ingredient: 'fat', effect: 'Even trace amounts prevent foam formation', notes: 'Any yolk contamination ruins meringue' },
        { ingredient: 'copper bowl', effect: 'Copper ions strengthen protein bonds', notes: 'Traditional for meringue, same effect as cream of tartar' }
      ],
      substitution_ratio: [
        { substitute: 'aquafaba', ratio: '3 tbsp aquafaba per egg white', notes: 'Chickpea liquid, whips to foam similarly' },
        { substitute: 'gelatin', ratio: '1 tsp gelatin bloom per 2 whites', notes: 'Structure only, not leavening' }
      ],
      temperature_sensitivity: 'Whites begin coagulating at 144°F (62°C), fully set at 149°F (65°C). Older eggs whip better (higher pH = more stable foam). Room temperature whites whip faster and higher than cold. Overwhipped whites become grainy and weep.',
      source_notes: 'USDA FoodData Central (FDC ID: 172185), On Food and Cooking by Harold McGee, average large white = 33g',
      confidence_level: 'verified'
    }
  ];

  // FATS
  const fats = [
    {
      name: 'Unsalted Butter',
      category: 'fat',
      description: 'Churned cream fat with ~80% milkfat, ~15% water, provides flavor, tenderness, and flakiness.',
      water_content_pct: 15.9,
      protein_content_pct: 0.9,
      fat_content_pct: 81.1,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.1,
      fiber_content_pct: 0.0,
      ph_level_min: 6.1,
      ph_level_max: 6.4,
      density_g_per_ml: 0.959,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: 'steam',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['rich', 'creamy', 'dairy', 'sweet'],
      primary_function: 'Tenderizes by shortening gluten strands, creates flakiness in laminated doughs, adds flavor.',
      interactions: [
        { ingredient: 'flour', effect: 'Coats flour proteins, inhibits gluten development', notes: 'Creates tender, crumbly texture' },
        { ingredient: 'sugar', effect: 'Creaming aerates for leavening', notes: 'Traps air bubbles for cake rise' },
        { ingredient: 'heat', effect: 'Melts 90-95°F (32-35°C), water evaporates creating steam', notes: 'Steam leavening in puff pastry' },
        { ingredient: 'eggs', effect: 'Emulsifies with eggs via milk solids', notes: 'Creates stable batter' }
      ],
      substitution_ratio: [
        { substitute: 'salted butter', ratio: '1:1 minus 1/4 tsp salt per stick', notes: 'Reduce added salt' },
        { substitute: 'shortening', ratio: '1:1', notes: 'Less flavor, higher melting point' },
        { substitute: 'oil', ratio: '0.75:1', notes: 'Use 3/4 cup oil per cup butter, lose structure' }
      ],
      temperature_sensitivity: 'Melts 90-95°F (32-35°C). Ideal creaming temperature 65-68°F (18-20°C). Water content creates steam leavening at 212°F (100°C). Milk solids brown (Maillard) starting at 250°F (121°C), burn above 350°F (177°C).',
      source_notes: 'USDA FoodData Central (FDC ID: 173410), Baking and Pastry by CIA',
      confidence_level: 'verified'
    },
    {
      name: 'Salted Butter',
      category: 'fat',
      description: 'Churned cream fat with added salt (~1.5-2%), extends shelf life and enhances flavor.',
      water_content_pct: 15.9,
      protein_content_pct: 0.9,
      fat_content_pct: 81.1,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.1,
      fiber_content_pct: 0.0,
      ph_level_min: 6.1,
      ph_level_max: 6.4,
      density_g_per_ml: 0.959,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: 'steam',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['rich', 'creamy', 'dairy', 'salty'],
      primary_function: 'Same as unsalted butter but with enhanced flavor and longer shelf life from salt.',
      interactions: [
        { ingredient: 'flour', effect: 'Identical to unsalted butter', notes: 'Tenderizes and shortens' },
        { ingredient: 'salt', effect: 'Contains 1.5-2% salt already', notes: 'Adjust recipe salt accordingly' },
        { ingredient: 'yeast', effect: 'High salt concentration can slow fermentation', notes: 'Salt inhibits yeast growth' }
      ],
      substitution_ratio: [
        { substitute: 'unsalted butter', ratio: '1:1 plus 1/4 tsp salt per stick', notes: 'Add back salt' },
        { substitute: 'shortening', ratio: '1:1 minus salt', notes: 'Adjust recipe salt' }
      ],
      temperature_sensitivity: 'Identical thermal properties to unsalted butter. Melts 90-95°F (32-35°C). Salt does not affect melting point but does enhance browning slightly.',
      source_notes: 'USDA FoodData Central (FDC ID: 173430), food science consensus, salt content varies by brand',
      confidence_level: 'verified'
    },
    {
      name: 'Shortening',
      category: 'fat',
      description: 'Hydrogenated vegetable oil, 100% fat with high melting point, creates very tender baked goods.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: null,
      ph_level_max: null,
      density_g_per_ml: 0.910,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'bland'],
      primary_function: 'Maximizes tenderness and creates stable structure due to high melting point and pure fat content.',
      interactions: [
        { ingredient: 'flour', effect: 'Coats gluten extremely effectively due to 100% fat', notes: 'Very tender, crumbly texture' },
        { ingredient: 'heat', effect: 'High melting point (117-119°F/47-48°C) maintains structure longer', notes: 'Cookies spread less, pie crusts hold shape' },
        { ingredient: 'sugar', effect: 'Creams well, holds air bubbles', notes: 'High-ratio shortening for professional cakes' }
      ],
      substitution_ratio: [
        { substitute: 'butter', ratio: '1:1 plus 2 tbsp water per cup', notes: 'Butter has 15% water' },
        { substitute: 'lard', ratio: '1:1', notes: 'Similar properties, slight flavor difference' },
        { substitute: 'coconut oil', ratio: '1:1', notes: 'Similar melting point when solid' }
      ],
      temperature_sensitivity: 'Melts 117-119°F (47-48°C), much higher than butter. No water content so no steam leavening. No milk solids so no browning. Remains plastic over wide temperature range, ideal for professional baking.',
      source_notes: 'USDA FoodData Central (FDC ID: 172338), Professional Baking by Wayne Gisslen',
      confidence_level: 'verified'
    },
    {
      name: 'Lard',
      category: 'fat',
      description: 'Rendered pork fat, 100% fat with unique crystalline structure that creates extremely flaky pastries.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: null,
      ph_level_max: null,
      density_g_per_ml: 0.919,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'mild pork', 'savory'],
      primary_function: 'Creates exceptionally flaky texture due to large fat crystals and high melting point.',
      interactions: [
        { ingredient: 'flour', effect: 'Large fat crystals create distinct flaky layers', notes: 'Superior pie crust flakiness' },
        { ingredient: 'heat', effect: 'Melts 97-113°F (36-45°C)', notes: 'Slightly higher than butter' },
        { ingredient: 'water', effect: 'Hydrophobic, creates moisture barriers', notes: 'Excellent for biscuits and pie crusts' }
      ],
      substitution_ratio: [
        { substitute: 'butter', ratio: '1:1', notes: 'Less flaky, more flavor' },
        { substitute: 'shortening', ratio: '1:1', notes: 'Similar texture, less flavor' }
      ],
      temperature_sensitivity: 'Melting range 97-113°F (36-45°C) depending on source. Large beta-prime crystals create superior flakiness. No water or milk solids. Traditional for pie crusts and biscuits.',
      source_notes: 'USDA FoodData Central (FDC ID: 173577), McGee On Food and Cooking',
      confidence_level: 'verified'
    },
    {
      name: 'Neutral Oil',
      category: 'fat',
      description: 'Vegetable oils (canola, vegetable, grapeseed) with neutral flavor and liquid state at room temperature.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: null,
      ph_level_max: null,
      density_g_per_ml: 0.920,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'clean'],
      primary_function: 'Tenderizes and moistens without adding flavor; cannot be creamed for leavening.',
      interactions: [
        { ingredient: 'flour', effect: 'Coats gluten strands very effectively in liquid form', notes: 'Very tender, moist crumb' },
        { ingredient: 'emulsifiers', effect: 'Requires lecithin or eggs to emulsify', notes: 'Does not naturally emulsify like butter' },
        { ingredient: 'heat', effect: 'Already liquid, no melting point', notes: 'Different texture than solid fats' }
      ],
      substitution_ratio: [
        { substitute: 'butter', ratio: '1:1.25', notes: 'Use 1 cup + 2 tbsp butter per cup oil' },
        { substitute: 'applesauce', ratio: '1:1', notes: 'For moisture only, not richness' }
      ],
      temperature_sensitivity: 'No melting point as already liquid. High smoke points (canola ~400°F/204°C, vegetable ~450°F/232°C) suitable for high-heat baking. Creates dense, moist crumb as cannot trap air when creamed.',
      source_notes: 'USDA FoodData Central (canola FDC ID: 171028), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Olive Oil',
      category: 'fat',
      description: 'Oil pressed from olives with distinctive flavor, liquid at room temperature.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: null,
      ph_level_max: null,
      density_g_per_ml: 0.916,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['fruity', 'grassy', 'peppery', 'olive'],
      primary_function: 'Adds distinctive flavor and moisture; creates tender texture and extends shelf life.',
      interactions: [
        { ingredient: 'flour', effect: 'Tenderizes like other oils', notes: 'Very moist crumb' },
        { ingredient: 'citrus', effect: 'Flavor affinity with lemon, orange', notes: 'Mediterranean baking tradition' },
        { ingredient: 'herbs', effect: 'Carries herb flavors well', notes: 'Savory breads and focaccia' }
      ],
      substitution_ratio: [
        { substitute: 'neutral oil', ratio: '1:1', notes: 'Lose distinctive flavor' },
        { substitute: 'butter', ratio: '1:1.25', notes: 'Different flavor profile' }
      ],
      temperature_sensitivity: 'Extra virgin smoke point ~375°F (191°C), refined ~465°F (241°C). Flavor compounds can become bitter at high heat. Best in moderate-temperature baking or no-bake applications. Polyphenols provide antioxidant shelf life.',
      source_notes: 'USDA FoodData Central (FDC ID: 171413), Mediterranean baking tradition',
      confidence_level: 'verified'
    },
    {
      name: 'Coconut Oil',
      category: 'fat',
      description: 'Oil extracted from coconut meat, solid below 76°F with high saturated fat content.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: null,
      ph_level_max: null,
      density_g_per_ml: 0.924,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['coconut', 'tropical', 'sweet'],
      primary_function: 'Vegan butter alternative that is solid at cool temps, liquid when warm, adds coconut flavor.',
      interactions: [
        { ingredient: 'flour', effect: 'Behaves like shortening when solid, oil when liquid', notes: 'Temperature-dependent texture' },
        { ingredient: 'chocolate', effect: 'Similar melting point creates smooth ganache', notes: 'Vegan chocolate applications' },
        { ingredient: 'cold', effect: 'Solidifies rapidly below 76°F (24°C)', notes: 'Creates flaky pastries when chilled' }
      ],
      substitution_ratio: [
        { substitute: 'butter', ratio: '1:1', notes: 'Vegan substitute, coconut flavor' },
        { substitute: 'shortening', ratio: '1:1', notes: 'Similar melting point when solid' }
      ],
      temperature_sensitivity: 'Melts at 76°F (24°C). Very sharp melting point creates unique mouthfeel. Refined has higher smoke point (~450°F/232°C) than unrefined (~350°F/177°C). High saturated fat (>90%) makes it very stable at room temperature.',
      source_notes: 'USDA FoodData Central (FDC ID: 171411), food science consensus',
      confidence_level: 'verified'
    }
  ];

  // SUGARS
  const sugars = [
    {
      name: 'Granulated White Sugar',
      category: 'sugar',
      description: 'Pure crystalline sucrose, the standard sweetener in baking, affects tenderness, moisture, and browning.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 99.9,
      fiber_content_pct: 0.0,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.845,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['sweet', 'clean', 'neutral'],
      primary_function: 'Sweetens, tenderizes by interfering with gluten, retains moisture, aids browning via caramelization and Maillard reaction.',
      interactions: [
        { ingredient: 'water', effect: 'Highly soluble, competes with flour for water', notes: 'Slows gluten development' },
        { ingredient: 'butter', effect: 'Creaming creates air pockets for leavening', notes: 'Sharp crystals cut into fat' },
        { ingredient: 'eggs', effect: 'Delays protein coagulation', notes: 'Tenderizes cakes' },
        { ingredient: 'heat', effect: 'Caramelizes starting at 320°F (160°C)', notes: 'Browns baked goods' },
        { ingredient: 'yeast', effect: 'Provides fermentable sugar', notes: 'Too much inhibits fermentation' }
      ],
      substitution_ratio: [
        { substitute: 'brown sugar', ratio: '1:1', notes: 'More moisture and molasses flavor' },
        { substitute: 'honey', ratio: '0.75:1', notes: 'Reduce liquid by 1/4 cup per cup, reduce temp 25°F' },
        { substitute: 'coconut sugar', ratio: '1:1', notes: 'Caramel flavor, darker color' }
      ],
      temperature_sensitivity: 'Melts and dissolves at 320°F (160°C), begins caramelizing creating color and flavor compounds. Maillard reaction with proteins starts at 285°F (140°C). High sugar content lowers water activity, extends shelf life.',
      source_notes: 'USDA FoodData Central (FDC ID: 169655), How Baking Works by Paula Figoni',
      confidence_level: 'verified'
    },
    {
      name: 'Light Brown Sugar',
      category: 'sugar',
      description: 'White sugar with ~3.5% molasses, adds moisture and subtle molasses flavor.',
      water_content_pct: 1.3,
      protein_content_pct: 0.1,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 97.0,
      fiber_content_pct: 0.0,
      ph_level_min: 4.5,
      ph_level_max: 5.5,
      density_g_per_ml: 0.720,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['sweet', 'caramel', 'molasses', 'warm'],
      primary_function: 'Sweetens like white sugar but adds moisture, acidity, and complex flavor from molasses.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Acid in molasses reacts with baking soda', notes: 'Produces CO2 leavening' },
        { ingredient: 'butter', effect: 'Creams well, moisture makes denser texture', notes: 'Chewier cookies than white sugar' },
        { ingredient: 'water', effect: 'More hygroscopic than white sugar', notes: 'Retains moisture, softer baked goods' }
      ],
      substitution_ratio: [
        { substitute: 'white sugar', ratio: '1:1', notes: 'Lose molasses flavor and moisture' },
        { substitute: 'dark brown sugar', ratio: '1:1', notes: 'Stronger molasses flavor' },
        { substitute: 'white sugar + molasses', ratio: '1 cup sugar + 1 tbsp molasses', notes: 'DIY brown sugar' }
      ],
      temperature_sensitivity: 'Similar to white sugar but molasses adds slight acidity (pH ~4.5-5.5) and increases hygroscopicity. Browns faster due to molasses content. Molasses can burn at high temperatures.',
      source_notes: 'USDA FoodData Central (FDC ID: 168833), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Dark Brown Sugar',
      category: 'sugar',
      description: 'White sugar with ~6.5% molasses, adds significant moisture and pronounced molasses flavor.',
      water_content_pct: 2.1,
      protein_content_pct: 0.1,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 95.5,
      fiber_content_pct: 0.0,
      ph_level_min: 4.0,
      ph_level_max: 5.0,
      density_g_per_ml: 0.720,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['sweet', 'molasses', 'caramel', 'toffee', 'robust'],
      primary_function: 'Sweetens with pronounced molasses character, adds moisture and acidity.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Higher acid content creates more CO2', notes: 'Stronger leavening reaction' },
        { ingredient: 'spices', effect: 'Robust flavor pairs with cinnamon, ginger, cloves', notes: 'Traditional in gingerbread' },
        { ingredient: 'chocolate', effect: 'Enhances chocolate flavor', notes: 'Deep, complex sweetness' }
      ],
      substitution_ratio: [
        { substitute: 'light brown sugar', ratio: '1:1', notes: 'Milder flavor' },
        { substitute: 'white sugar + molasses', ratio: '1 cup sugar + 2 tbsp molasses', notes: 'DIY dark brown sugar' }
      ],
      temperature_sensitivity: 'Similar to light brown but more acidic (pH ~4.0-5.0) and hygroscopic. Molasses can burn above 350°F (177°C). Creates very moist, chewy baked goods.',
      source_notes: 'USDA FoodData Central (FDC ID: 168834), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Powdered Sugar',
      category: 'sugar',
      description: 'Finely ground white sugar with ~3% cornstarch to prevent caking, dissolves instantly.',
      water_content_pct: 0.2,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 3.0,
      sugar_content_pct: 96.5,
      fiber_content_pct: 0.0,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.560,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['sweet', 'clean', 'neutral'],
      primary_function: 'Creates smooth icings and frostings, dissolves instantly, tenderizes with less moisture interference.',
      interactions: [
        { ingredient: 'liquid', effect: 'Dissolves instantly without heat', notes: 'Ideal for uncooked frostings' },
        { ingredient: 'butter', effect: 'Creams into smooth, fluffy frosting', notes: 'Cornstarch prevents graininess' },
        { ingredient: 'fat', effect: 'Cornstarch absorbs excess moisture', notes: 'Prevents weeping in buttercream' }
      ],
      substitution_ratio: [
        { substitute: 'granulated sugar', ratio: '1.75:1', notes: 'Use 1 3/4 cup powdered per cup granulated' },
        { substitute: 'DIY', ratio: 'Blend granulated + 3% cornstarch', notes: 'High-powered blender needed' }
      ],
      temperature_sensitivity: 'Similar to granulated but finer crystals dissolve faster. Cornstarch can create slight starchy taste if overused. Not ideal for creaming leavening due to fine texture. Excellent for dusting and finishing.',
      source_notes: 'USDA FoodData Central (FDC ID: 169656), Professional Baking by Wayne Gisslen',
      confidence_level: 'verified'
    },
    {
      name: 'Honey',
      category: 'sugar',
      description: 'Natural invert sugar from bees, hygroscopic, adds moisture, flavor, and extends shelf life.',
      water_content_pct: 17.1,
      protein_content_pct: 0.3,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 82.1,
      fiber_content_pct: 0.2,
      ph_level_min: 3.4,
      ph_level_max: 6.1,
      density_g_per_ml: 1.42,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['floral', 'sweet', 'complex', 'varies by source'],
      primary_function: 'Sweetens, adds moisture, extends shelf life via hygroscopicity, adds complex flavor.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Acid in honey reacts with soda', notes: 'Provides leavening' },
        { ingredient: 'water', effect: 'Already contains 17% water', notes: 'Reduce liquid in recipe' },
        { ingredient: 'heat', effect: 'Burns and caramelizes faster than sugar', notes: 'Reduce oven temp by 25°F' },
        { ingredient: 'yeast', effect: 'Inverted sugars ferment easily', notes: 'Accelerates yeast activity' }
      ],
      substitution_ratio: [
        { substitute: 'white sugar', ratio: '1:1.25', notes: 'Use 1 1/4 cup sugar + 1/4 cup liquid per cup honey, increase oven temp 25°F' },
        { substitute: 'maple syrup', ratio: '1:1', notes: 'Similar moisture content' }
      ],
      temperature_sensitivity: 'Fructose in honey browns faster than sucrose (lower Maillard temperature). Burns easily above 300°F (149°C). Reduce oven temp by 25°F when substituting for sugar. Hygroscopic nature keeps baked goods moist for days.',
      source_notes: 'USDA FoodData Central (FDC ID: 169640), On Food and Cooking by Harold McGee',
      confidence_level: 'verified'
    },
    {
      name: 'Maple Syrup',
      category: 'sugar',
      description: 'Concentrated sap from maple trees, ~67% sugar, adds distinctive flavor and moisture.',
      water_content_pct: 32.4,
      protein_content_pct: 0.0,
      fat_content_pct: 0.2,
      starch_content_pct: 0.0,
      sugar_content_pct: 67.0,
      fiber_content_pct: 0.0,
      ph_level_min: 6.5,
      ph_level_max: 7.0,
      density_g_per_ml: 1.32,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['maple', 'caramel', 'woodsy', 'complex'],
      primary_function: 'Sweetens with distinctive maple flavor, adds moisture, creates chewy texture.',
      interactions: [
        { ingredient: 'water', effect: 'Contains 32% water', notes: 'Reduce liquid significantly' },
        { ingredient: 'baking soda', effect: 'Neutral to slightly alkaline pH', notes: 'Less reaction than acidic sweeteners' },
        { ingredient: 'heat', effect: 'Caramelizes and intensifies flavor', notes: 'Browns moderately' }
      ],
      substitution_ratio: [
        { substitute: 'honey', ratio: '1:1', notes: 'Different flavor, similar moisture' },
        { substitute: 'white sugar', ratio: '1:0.75', notes: 'Use 3/4 cup sugar + 3 tbsp liquid per cup syrup' }
      ],
      temperature_sensitivity: 'Higher water content than honey. Primarily sucrose (not inverted) so browns differently. Flavor compounds volatile, can dissipate at high heat. Reduces like other syrups, concentrating sugars.',
      source_notes: 'USDA FoodData Central (FDC ID: 169661), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Molasses',
      category: 'sugar',
      description: 'Byproduct of sugar refining, highly acidic, robust flavor, very hygroscopic.',
      water_content_pct: 21.9,
      protein_content_pct: 0.0,
      fat_content_pct: 0.1,
      starch_content_pct: 0.0,
      sugar_content_pct: 74.7,
      fiber_content_pct: 0.0,
      ph_level_min: 4.9,
      ph_level_max: 5.4,
      density_g_per_ml: 1.40,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['robust', 'bitter', 'complex', 'mineral', 'molasses'],
      primary_function: 'Adds dark color, strong flavor, acidity for leavening, and extreme moisture retention.',
      interactions: [
        { ingredient: 'baking soda', effect: 'High acidity creates vigorous CO2 reaction', notes: 'Essential pairing in gingerbread' },
        { ingredient: 'spices', effect: 'Strong flavor stands up to bold spices', notes: 'Traditional in spice cakes' },
        { ingredient: 'water', effect: 'Very hygroscopic, pulls moisture from air', notes: 'Keeps baked goods soft for weeks' }
      ],
      substitution_ratio: [
        { substitute: 'honey', ratio: '1:1', notes: 'Lose robust flavor and acidity' },
        { substitute: 'dark corn syrup', ratio: '1:1', notes: 'Milder flavor' }
      ],
      temperature_sensitivity: 'Contains invert sugars that brown quickly. Can burn above 300°F (149°C). Very acidic (pH 4.9-5.4) so reacts strongly with baking soda. Creates dark, moist baked goods.',
      source_notes: 'USDA FoodData Central (FDC ID: 169663), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Corn Syrup',
      category: 'sugar',
      description: 'Glucose syrup derived from corn starch, prevents crystallization, adds shine and chew.',
      water_content_pct: 24.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 76.0,
      fiber_content_pct: 0.0,
      ph_level_min: 4.0,
      ph_level_max: 5.0,
      density_g_per_ml: 1.38,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['mild sweet', 'neutral'],
      primary_function: 'Prevents sugar crystallization, adds chewiness, creates glossy finish, retains moisture.',
      interactions: [
        { ingredient: 'sugar', effect: 'Interferes with sucrose crystallization', notes: 'Essential for smooth candy and frosting' },
        { ingredient: 'water', effect: 'Contains 24% water', notes: 'Adjust recipe liquids' },
        { ingredient: 'heat', effect: 'Stable at high temperatures', notes: 'Ideal for candy making' }
      ],
      substitution_ratio: [
        { substitute: 'honey', ratio: '1:1', notes: 'Adds flavor, similar anti-crystallization' },
        { substitute: 'golden syrup', ratio: '1:1', notes: 'UK equivalent with slight caramel flavor' }
      ],
      temperature_sensitivity: 'Very stable at high heat, does not caramelize easily. Primarily glucose (not sucrose) so different browning behavior. Hygroscopic nature creates chewy texture in cookies and bars. Prevents ice crystal formation in frozen desserts.',
      source_notes: 'USDA FoodData Central (FDC ID: 169670), food science consensus',
      confidence_level: 'verified'
    }
  ];

  // LEAVENERS
  const leaveners = [
    {
      name: 'Active Dry Yeast',
      category: 'leavener',
      description: 'Dormant yeast cells requiring rehydration, biological leavening via CO2 from fermentation.',
      water_content_pct: 8.0,
      protein_content_pct: 40.4,
      fat_content_pct: 7.6,
      starch_content_pct: 0.0,
      sugar_content_pct: 12.3,
      fiber_content_pct: 26.9,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.780,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'biological',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['yeasty', 'bread-like', 'fermented'],
      primary_function: 'Produces CO2 via fermentation to leaven bread, develops flavor through enzymatic activity.',
      interactions: [
        { ingredient: 'sugar', effect: 'Feeds yeast for fermentation', notes: 'Too much (>10% of flour) inhibits yeast' },
        { ingredient: 'salt', effect: 'Inhibits yeast growth, strengthens gluten', notes: 'Keep away from direct contact' },
        { ingredient: 'water', effect: 'Must be rehydrated in warm water (105-115°F)', notes: 'Too hot kills yeast, too cold slows activation' },
        { ingredient: 'heat', effect: 'Dies at 140°F (60°C), most active 80-95°F (27-35°C)', notes: 'Oven spring stops when yeast dies' }
      ],
      substitution_ratio: [
        { substitute: 'instant yeast', ratio: '1:0.75', notes: 'Use 25% less instant yeast, no proofing needed' },
        { substitute: 'fresh yeast', ratio: '1:3', notes: '1 oz fresh = 1 tbsp dry' },
        { substitute: 'sourdough starter', ratio: 'Complex', notes: 'Requires recipe reformulation, longer fermentation' }
      ],
      temperature_sensitivity: 'Optimal activity 80-95°F (27-35°C). Dormant below 50°F (10°C), slow below 70°F (21°C). Dies at 140°F (60°C). Requires warm water (105-115°F/41-46°C) for rehydration. Refrigeration slows fermentation, freezing kills some cells.',
      source_notes: 'USDA FoodData Central (FDC ID: 175218), Bread Science by Emily Buehler',
      confidence_level: 'verified'
    },
    {
      name: 'Instant Yeast',
      category: 'leavener',
      description: 'Fine-grain yeast that activates instantly without proofing, faster and more reliable than active dry.',
      water_content_pct: 8.0,
      protein_content_pct: 40.4,
      fat_content_pct: 7.6,
      starch_content_pct: 0.0,
      sugar_content_pct: 12.3,
      fiber_content_pct: 26.9,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.780,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'biological',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['yeasty', 'bread-like', 'fermented'],
      primary_function: 'Produces CO2 rapidly via fermentation without requiring rehydration step.',
      interactions: [
        { ingredient: 'flour', effect: 'Can be mixed directly into dry ingredients', notes: 'No proofing step needed' },
        { ingredient: 'sugar', effect: 'Feeds yeast, too much inhibits', notes: 'Same as active dry' },
        { ingredient: 'salt', effect: 'Inhibits but can be mixed together', notes: 'More tolerant than active dry' },
        { ingredient: 'cold', effect: 'Can ferment in refrigerator slowly', notes: 'Cold fermentation develops flavor' }
      ],
      substitution_ratio: [
        { substitute: 'active dry yeast', ratio: '1:1.25', notes: 'Use 25% more active dry, proof first' },
        { substitute: 'fresh yeast', ratio: '1:3', notes: 'Use 3x fresh yeast by weight' }
      ],
      temperature_sensitivity: 'Same thermal properties as active dry (optimal 80-95°F/27-35°C, dies at 140°F/60°C) but does not require warm water activation. More resilient to temperature fluctuations. Faster fermentation than active dry.',
      source_notes: 'USDA FoodData Central, King Arthur Baking, food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Baking Powder',
      category: 'leavener',
      description: 'Double-acting chemical leavener containing baking soda, acid, and cornstarch, produces CO2 when wet and when heated.',
      water_content_pct: 2.2,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 73.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.2,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.900,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'chemical',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'slightly bitter if overused'],
      primary_function: 'Produces CO2 gas in two stages: when moistened and when heated, creating lift in quick breads and cakes.',
      interactions: [
        { ingredient: 'liquid', effect: 'First reaction releases CO2 when wet', notes: 'Bake soon after mixing' },
        { ingredient: 'heat', effect: 'Second reaction at 140-180°F (60-82°C)', notes: 'Double-acting provides insurance' },
        { ingredient: 'acid', effect: 'Already contains acid, no external acid needed', notes: 'Works in neutral batters' },
        { ingredient: 'time', effect: 'Loses potency after 6-12 months', notes: 'Test before use: fizz in hot water' }
      ],
      substitution_ratio: [
        { substitute: 'baking soda + acid', ratio: '1:0.25 soda + acid', notes: '1 tsp baking powder = 1/4 tsp soda + 1/2 tsp cream of tartar' },
        { substitute: 'self-rising flour', ratio: 'Contains baking powder', notes: '1 cup = 1 cup AP + 1.5 tsp powder + 1/4 tsp salt' }
      ],
      temperature_sensitivity: 'First acid (monocalcium phosphate) reacts at room temp when wet. Second acid (sodium aluminum sulfate or sodium acid pyrophosphate) reacts at 140-180°F (60-82°C). Loses potency with age and humidity exposure. Store in cool, dry place.',
      source_notes: 'USDA FoodData Central (FDC ID: 172318), How Baking Works by Paula Figoni',
      confidence_level: 'verified'
    },
    {
      name: 'Baking Soda',
      category: 'leavener',
      description: 'Pure sodium bicarbonate, requires acid to produce CO2, single-acting chemical leavener.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 8.3,
      ph_level_max: 8.5,
      density_g_per_ml: 2.200,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'chemical',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['metallic', 'soapy if not neutralized', 'bitter'],
      primary_function: 'Reacts with acid to produce CO2 for leavening, alkalinizes environment affecting browning and gluten.',
      interactions: [
        { ingredient: 'acid', effect: 'Neutralization produces CO2, water, salt', notes: 'Requires buttermilk, yogurt, molasses, vinegar, etc.' },
        { ingredient: 'cocoa', effect: 'Darkens cocoa via alkaline environment', notes: 'Creates darker, reddish brownies and cakes' },
        { ingredient: 'gluten', effect: 'Alkaline pH weakens gluten', notes: 'Creates tender crumb, can make baked goods too tender' },
        { ingredient: 'maillard reaction', effect: 'Alkaline environment accelerates browning', notes: 'Faster browning, darker color' }
      ],
      substitution_ratio: [
        { substitute: 'baking powder', ratio: '1:4', notes: 'Use 4x baking powder, remove acid from recipe' },
        { substitute: 'potassium bicarbonate', ratio: '1:1.5', notes: 'Lower sodium alternative' }
      ],
      temperature_sensitivity: 'Reacts immediately when acid and moisture are present. No heat required for reaction but heat accelerates it. Reaction complete quickly so bake batters immediately. Excess soda creates soapy, bitter taste. pH of 8.3 creates alkaline environment.',
      source_notes: 'USDA FoodData Central, food science consensus, standard ratio is 1/4 tsp per cup flour with acid',
      confidence_level: 'verified'
    },
    {
      name: 'Cream of Tartar',
      category: 'leavener',
      description: 'Potassium bitartrate, acidic powder used to activate baking soda and stabilize egg white foams.',
      water_content_pct: 1.8,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 3.2,
      ph_level_max: 3.8,
      density_g_per_ml: 1.050,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'chemical',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['tart', 'acidic'],
      primary_function: 'Provides acid for baking soda leavening, stabilizes egg white foam, prevents sugar crystallization.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Reacts to produce CO2 leavening', notes: '2:1 ratio (cream of tartar:soda) makes baking powder' },
        { ingredient: 'egg whites', effect: 'Lowers pH, stabilizes foam', notes: '1/8 tsp per white prevents overbeating collapse' },
        { ingredient: 'sugar syrup', effect: 'Prevents crystallization, inverts some sucrose', notes: 'Creates smoother frosting and candy' }
      ],
      substitution_ratio: [
        { substitute: 'lemon juice', ratio: '1:2', notes: 'Use 2 tsp lemon juice per tsp cream of tartar' },
        { substitute: 'white vinegar', ratio: '1:2', notes: 'Use 2 tsp vinegar per tsp cream of tartar' }
      ],
      temperature_sensitivity: 'Stable at baking temperatures. Acid reaction with baking soda occurs immediately when wet. In meringues, acid strengthens protein bonds for more stable foam. Prevents sucrose inversion at high temperatures.',
      source_notes: 'Food science consensus, Modernist Cuisine',
      confidence_level: 'verified'
    }
  ];

  // Combine all ingredients
  const allIngredients = [...flours, ...eggs, ...fats, ...sugars, ...leaveners];

  // Insert ingredients
  for (const ingredient of allIngredients) {
    await prisma.ingredient.create({ data: ingredient });
  }

  console.log(`✅ Seeded ${allIngredients.length} ingredients`);
  console.log(`   - ${flours.length} flours`);
  console.log(`   - ${eggs.length} egg types`);
  console.log(`   - ${fats.length} fats`);
  console.log(`   - ${sugars.length} sugars`);
  console.log(`   - ${leaveners.length} leaveners`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
