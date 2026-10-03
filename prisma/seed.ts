import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Full catalog is ~62 ingredients; allow small drift from edits */
const MIN_CATALOG_ROWS = 50;

async function main() {
  const existing = await prisma.ingredient.count();
  const hasWater = await prisma.ingredient.findFirst({ where: { name: 'Water' } });
  const hasSalt = await prisma.ingredient.findFirst({ where: { name: 'Table Salt' } });
  const hasGraham = await prisma.ingredient.findFirst({ where: { name: 'Graham Cracker Crumbs' } });
  const hasMalt = await prisma.ingredient.findFirst({ where: { name: 'Diastatic Malt Powder' } });
  const hasFreshYeast = await prisma.ingredient.findFirst({ where: { name: 'Fresh Yeast' } });

  if (existing >= MIN_CATALOG_ROWS && hasWater && hasSalt && hasGraham && hasMalt && hasFreshYeast) {
    console.log(`✅ Ingredient catalog OK (${existing} rows), skip seed`);
    return;
  }

  console.log(
    `🌱 Syncing BakeBase catalog (found ${existing} rows; water=${Boolean(hasWater)} salt=${Boolean(hasSalt)} graham=${Boolean(hasGraham)})...`
  );

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

  // LIQUIDS
  const liquids = [
    {
      name: 'Water',
      category: 'liquid',
      description: 'Pure H2O, the universal solvent that hydrates flour proteins to form gluten and dissolves ingredients.',
      water_content_pct: 100.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 6.5,
      ph_level_max: 7.5,
      density_g_per_ml: 1.0,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'steam',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'clean'],
      primary_function: 'Hydrates flour to develop gluten, dissolves ingredients, creates steam for leavening, controls dough consistency.',
      interactions: [
        { ingredient: 'flour', effect: 'Hydrates proteins to form gluten network', notes: 'Ratio determines dough consistency' },
        { ingredient: 'yeast', effect: 'Dissolves and activates yeast', notes: 'Temperature critical: 105-115°F for active dry' },
        { ingredient: 'salt', effect: 'Dissolves salt for even distribution', notes: 'Prevents salt from directly contacting yeast' },
        { ingredient: 'heat', effect: 'Converts to steam at 212°F (100°C)', notes: 'Steam leavening in popovers, cream puffs, bread' }
      ],
      substitution_ratio: [
        { substitute: 'milk', ratio: '1:1', notes: 'Adds protein and fat, softer crumb' },
        { substitute: 'buttermilk', ratio: '1:1', notes: 'Adds acid and tang' }
      ],
      temperature_sensitivity: 'Freezes at 32°F (0°C), boils at 212°F (100°C) at sea level. Hard water (high mineral content) can toughen gluten. Soft water can make dough sticky. Chlorine in tap water can inhibit yeast.',
      source_notes: 'Food science consensus, Bread Science by Emily Buehler',
      confidence_level: 'verified'
    },
    {
      name: 'Whole Milk',
      category: 'liquid',
      description: 'Full-fat cow\'s milk with ~3.25% milkfat, adds richness, protein, and lactose to baked goods.',
      water_content_pct: 88.0,
      protein_content_pct: 3.2,
      fat_content_pct: 3.25,
      starch_content_pct: 0.0,
      sugar_content_pct: 4.8,
      fiber_content_pct: 0.0,
      ph_level_min: 6.5,
      ph_level_max: 6.7,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['creamy', 'sweet', 'mild', 'dairy'],
      primary_function: 'Provides liquid for hydration plus fat for tenderness, protein for structure, lactose for browning.',
      interactions: [
        { ingredient: 'flour', effect: 'Milk proteins strengthen dough, fat tenderizes', notes: 'Creates softer, finer crumb than water' },
        { ingredient: 'yeast', effect: 'Lactose feeds yeast slowly, milk proteins enrich dough', notes: 'Scalding milk denatures proteins that can inhibit yeast' },
        { ingredient: 'heat', effect: 'Milk sugars brown via Maillard reaction', notes: 'Creates golden crust' },
        { ingredient: 'acid', effect: 'Curdles when combined with strong acid', notes: 'Can be intentional for buttermilk substitute' }
      ],
      substitution_ratio: [
        { substitute: 'water', ratio: '1:1', notes: 'Lose richness and browning' },
        { substitute: 'buttermilk', ratio: '1:1', notes: 'Add 1/8 tsp baking soda per cup to neutralize acid' },
        { substitute: 'non-dairy milk', ratio: '1:1', notes: 'Soy milk closest to dairy milk properties' }
      ],
      temperature_sensitivity: 'Proteins denature at 180°F (82°C). Scalding (180°F) denatures whey proteins that can inhibit yeast. Fat emulsion stable at baking temps. Lactose does not caramelize but participates in Maillard browning starting at 285°F (140°C).',
      source_notes: 'USDA FoodData Central (FDC ID: 746782), On Food and Cooking by Harold McGee',
      confidence_level: 'verified'
    },
    {
      name: 'Buttermilk',
      category: 'liquid',
      description: 'Cultured low-fat milk with lactic acid bacteria, acidic liquid that tenderizes and reacts with baking soda.',
      water_content_pct: 90.0,
      protein_content_pct: 3.3,
      fat_content_pct: 1.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 4.8,
      fiber_content_pct: 0.0,
      ph_level_min: 4.4,
      ph_level_max: 4.8,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['tangy', 'sour', 'rich', 'complex'],
      primary_function: 'Provides acidity for chemical leavening with baking soda, tenderizes gluten, adds tang.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Acid reacts with soda to produce CO2', notes: 'Essential pairing for tender quick breads' },
        { ingredient: 'gluten', effect: 'Acid weakens gluten structure', notes: 'Creates very tender biscuits and pancakes' },
        { ingredient: 'cocoa', effect: 'Acid enhances chocolate flavor', notes: 'Traditional in red velvet and chocolate cakes' },
        { ingredient: 'cream', effect: 'Can be churned to make cultured butter', notes: 'Historical source before commercial buttermilk' }
      ],
      substitution_ratio: [
        { substitute: 'milk + vinegar', ratio: '1 cup milk + 1 tbsp vinegar', notes: 'Let sit 5 minutes, similar acidity' },
        { substitute: 'milk + lemon juice', ratio: '1 cup milk + 1 tbsp lemon juice', notes: 'Same as vinegar method' },
        { substitute: 'plain yogurt', ratio: '1:1 thinned with milk', notes: 'Similar tang and acidity' }
      ],
      temperature_sensitivity: 'Lactic acid stable at baking temps. Proteins coagulate similarly to milk. pH 4.4-4.8 provides optimal environment for baking soda reaction. Do not boil as it can separate.',
      source_notes: 'USDA FoodData Central (FDC ID: 170417), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Heavy Cream',
      category: 'liquid',
      description: 'High-fat dairy cream with 36-40% milkfat, whips to stable foam, adds richness and moisture.',
      water_content_pct: 57.7,
      protein_content_pct: 2.1,
      fat_content_pct: 37.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 2.8,
      fiber_content_pct: 0.0,
      ph_level_min: 6.5,
      ph_level_max: 6.8,
      density_g_per_ml: 1.01,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: 'mechanical',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['rich', 'creamy', 'buttery', 'luxurious'],
      primary_function: 'Creates stable whipped cream for mechanical leavening, adds richness and moisture, high-fat liquid.',
      interactions: [
        { ingredient: 'air', effect: 'Fat globules stabilize air bubbles when whipped', notes: 'Whips to 2x volume, stable foam' },
        { ingredient: 'sugar', effect: 'Sugar stabilizes whipped cream foam', notes: 'Add after soft peaks for best stability' },
        { ingredient: 'heat', effect: 'Reduces to thick sauce, fat emulsion', notes: 'Ganache base with chocolate' },
        { ingredient: 'acid', effect: 'Can be cultured to make crème fraîche', notes: 'Buttermilk + cream + 24 hours' }
      ],
      substitution_ratio: [
        { substitute: 'half-and-half', ratio: '1:1', notes: 'Will not whip, less rich' },
        { substitute: 'coconut cream', ratio: '1:1', notes: 'Vegan alternative, refrigerate can first' },
        { substitute: 'whole milk', ratio: '1:1', notes: 'Much less rich, thinner texture' }
      ],
      temperature_sensitivity: 'Must be cold (below 40°F/4°C) to whip properly. Fat globules destabilize when warm. Overwhipping breaks emulsion creating butter. Ultra-pasteurized cream whips less stably than regular pasteurized.',
      source_notes: 'USDA FoodData Central (FDC ID: 170859), Modernist Cuisine',
      confidence_level: 'verified'
    }
  ];

  // SALTS
  const salts = [
    {
      name: 'Table Salt',
      category: 'salt',
      description: 'Fine-grain sodium chloride with anti-caking agents, standard seasoning and gluten strengthener.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 7.0,
      ph_level_max: 7.0,
      density_g_per_ml: 2.16,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['salty', 'clean', 'sharp'],
      primary_function: 'Enhances flavor, strengthens gluten, controls yeast fermentation, affects browning.',
      interactions: [
        { ingredient: 'flour', effect: 'Strengthens and tightens gluten network', notes: 'Essential for bread structure, typically 1.8-2% of flour weight' },
        { ingredient: 'yeast', effect: 'Inhibits yeast fermentation in high concentrations', notes: 'Slows fermentation, extends flavor development' },
        { ingredient: 'butter', effect: 'Enhances buttery flavor', notes: 'Traditional in most baking' },
        { ingredient: 'sugar', effect: 'Salt balances sweetness', notes: 'Critical even in sweet baked goods' }
      ],
      substitution_ratio: [
        { substitute: 'kosher salt', ratio: '1:1.5', notes: 'Use 1.5x volume kosher salt due to larger crystals' },
        { substitute: 'sea salt', ratio: '1:1', notes: 'Fine sea salt substitutes 1:1' }
      ],
      temperature_sensitivity: 'Stable at all baking temperatures. Does not evaporate or decompose. Delays Maillard browning slightly by interfering with amino acids. Prevents staling by binding water.',
      source_notes: 'Food science consensus, Bread Science by Emily Buehler, typical ratio 1.8-2% of flour weight',
      confidence_level: 'verified'
    },
    {
      name: 'Kosher Salt',
      category: 'salt',
      description: 'Coarse-grain sodium chloride without additives, dissolves slower than table salt.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 7.0,
      ph_level_max: 7.0,
      density_g_per_ml: 1.20,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['salty', 'clean', 'pure'],
      primary_function: 'Same as table salt but larger crystals provide texture and slower dissolution.',
      interactions: [
        { ingredient: 'flour', effect: 'Identical to table salt when dissolved', notes: 'Same gluten strengthening' },
        { ingredient: 'dough', effect: 'Slower dissolution due to larger crystals', notes: 'Mix thoroughly to distribute evenly' },
        { ingredient: 'surface', effect: 'Can be sprinkled on top for crunchy texture', notes: 'Pretzel salt, focaccia topping' }
      ],
      substitution_ratio: [
        { substitute: 'table salt', ratio: '1:0.67', notes: 'Use 2/3 volume table salt (or equal by weight)' },
        { substitute: 'sea salt flakes', ratio: '1:1', notes: 'Similar crystal size' }
      ],
      temperature_sensitivity: 'Identical to table salt thermally. No additives means pure sodium chloride behavior. Larger crystals take longer to dissolve in cold liquids. Popular for even seasoning and clean flavor.',
      source_notes: 'Food science consensus, note: volume measurements vary by brand (Diamond vs Morton)',
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
      name: 'Fresh Yeast',
      category: 'leavener',
      description:
        'Compressed cake yeast with high moisture; common in bakeries. Weigh for precision — not interchangeable gram-for-gram with dry yeast.',
      water_content_pct: 70.0,
      protein_content_pct: 12.0,
      fat_content_pct: 1.5,
      starch_content_pct: 0.0,
      sugar_content_pct: 2.0,
      fiber_content_pct: 6.0,
      ph_level_min: 5.0,
      ph_level_max: 6.5,
      density_g_per_ml: 1.05,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: 'biological',
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['yeasty', 'mild', 'fermented'],
      primary_function: 'Biological leavening via fermentation; faster activity than dry yeast at similar cell counts.',
      interactions: [
        { ingredient: 'salt', effect: 'Inhibits yeast', notes: 'Dissolve or crumble evenly into dough' },
        { ingredient: 'sugar', effect: 'Feeds fermentation', notes: 'High sugar slows yeast' },
        { ingredient: 'cold', effect: 'Short shelf life refrigerated', notes: 'Freeze for longer storage' }
      ],
      substitution_ratio: [
        { substitute: 'instant yeast', ratio: '1:0.33', notes: 'About 1 g instant per 3 g fresh' },
        { substitute: 'active dry yeast', ratio: '1:0.4', notes: 'Roughly 40% of fresh weight; proof active dry' }
      ],
      temperature_sensitivity:
        'Active 75–85°F (24–29°C). Dies above ~140°F (60°C). Refrigerate; use within ~2 weeks typical.',
      source_notes: 'King Arthur Baking, bakery industry references',
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

  // STARCHES
  const starches = [
    {
      name: 'Cornstarch',
      category: 'starch',
      description: 'Pure starch extracted from corn, used as thickener and to tenderize baked goods.',
      water_content_pct: 8.3,
      protein_content_pct: 0.3,
      fat_content_pct: 0.1,
      starch_content_pct: 91.3,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.9,
      ph_level_min: 4.0,
      ph_level_max: 7.0,
      density_g_per_ml: 0.560,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'bland'],
      primary_function: 'Tenderizes by diluting gluten, thickens liquids, creates crisp texture in cookies.',
      interactions: [
        { ingredient: 'flour', effect: 'Dilutes protein content, weakens gluten', notes: 'Makes cake flour substitute with AP flour' },
        { ingredient: 'liquid', effect: 'Thickens at 203°F (95°C) via gelatinization', notes: 'Cloudy gel, can thin if overheated' },
        { ingredient: 'acid', effect: 'Acid can prevent thickening', notes: 'Add acid after thickening occurs' }
      ],
      substitution_ratio: [
        { substitute: 'all-purpose flour', ratio: '1:2', notes: 'Use 2 tbsp flour per tbsp cornstarch for thickening' },
        { substitute: 'tapioca starch', ratio: '1:1', notes: 'Clear gel vs cloudy' },
        { substitute: 'arrowroot powder', ratio: '1:1', notes: 'Similar properties' }
      ],
      temperature_sensitivity: 'Gelatinizes 144-158°F (62-70°C), fully thickened at 203°F (95°C). Breaks down with prolonged heat or vigorous stirring. Freezes and thaws poorly (weeping). Creates crisp texture in cookies by absorbing moisture.',
      source_notes: 'USDA FoodData Central (FDC ID: 168918), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Tapioca Starch',
      category: 'starch',
      description: 'Starch from cassava root, creates clear gel and chewy texture, gluten-free.',
      water_content_pct: 11.0,
      protein_content_pct: 0.2,
      fat_content_pct: 0.0,
      starch_content_pct: 88.7,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.1,
      ph_level_min: 4.5,
      ph_level_max: 7.0,
      density_g_per_ml: 0.540,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'clean'],
      primary_function: 'Creates clear gel for pie fillings, adds chew to gluten-free baking, crisps coatings.',
      interactions: [
        { ingredient: 'liquid', effect: 'Thickens to clear, glossy gel', notes: 'Better freeze-thaw stability than cornstarch' },
        { ingredient: 'acid', effect: 'More acid-stable than cornstarch', notes: 'Ideal for fruit pies' },
        { ingredient: 'gluten-free flour', effect: 'Adds structure and chew', notes: 'Essential in GF flour blends' }
      ],
      substitution_ratio: [
        { substitute: 'cornstarch', ratio: '1:1', notes: 'Cloudy gel instead of clear' },
        { substitute: 'arrowroot', ratio: '1:1', notes: 'Similar clarity' }
      ],
      temperature_sensitivity: 'Gelatinizes at lower temp than cornstarch (131-144°F/55-62°C). Creates elastic, chewy gel. Excellent freeze-thaw stability. Works in acidic fillings. Remains stable when cooled.',
      source_notes: 'USDA FoodData Central, food science consensus, traditional in Brazilian cheese bread',
      confidence_level: 'verified'
    }
  ];

  // CHOCOLATE
  const chocolates = [
    {
      name: 'Unsweetened Cocoa Powder',
      category: 'chocolate',
      description: 'Roasted cocoa beans with cocoa butter removed, intense chocolate flavor, no sugar.',
      water_content_pct: 3.0,
      protein_content_pct: 19.6,
      fat_content_pct: 13.7,
      starch_content_pct: 0.0,
      sugar_content_pct: 1.8,
      fiber_content_pct: 33.2,
      ph_level_min: 5.3,
      ph_level_max: 5.8,
      density_g_per_ml: 0.480,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['bitter', 'chocolate', 'intense', 'acidic'],
      primary_function: 'Provides chocolate flavor without sweetness, absorbs liquid, adds color and slight bitterness.',
      interactions: [
        { ingredient: 'sugar', effect: 'Essential to balance bitterness', notes: 'Unsweetened cocoa requires added sugar' },
        { ingredient: 'baking soda', effect: 'Neutralizes acidity, darkens color', notes: 'Dutch-process vs natural cocoa' },
        { ingredient: 'liquid', effect: 'Absorbs liquid like flour, needs extra hydration', notes: 'Reduce flour slightly when adding cocoa' },
        { ingredient: 'fat', effect: 'Fat content provides richness despite being "unsweetened"', notes: '10-14% cocoa butter remains' }
      ],
      substitution_ratio: [
        { substitute: 'unsweetened chocolate', ratio: '3 tbsp cocoa + 1 tbsp fat per oz chocolate', notes: 'Cocoa is defatted chocolate' },
        { substitute: 'Dutch-process cocoa', ratio: '1:1 plus adjust leavening', notes: 'Natural cocoa is acidic, Dutch is neutral' }
      ],
      temperature_sensitivity: 'Stable at baking temps. Natural cocoa (pH 5.3-5.8) reacts with baking soda. Flavor compounds can become harsh if overheated. Blooms if exposed to moisture then dried.',
      source_notes: 'USDA FoodData Central (FDC ID: 170369), On Food and Cooking by Harold McGee',
      confidence_level: 'verified'
    },
    {
      name: 'Dark Chocolate',
      category: 'chocolate',
      description: 'Chocolate with 60-85% cacao, contains cocoa solids, cocoa butter, and some sugar.',
      water_content_pct: 0.8,
      protein_content_pct: 7.8,
      fat_content_pct: 42.6,
      starch_content_pct: 0.0,
      sugar_content_pct: 23.9,
      fiber_content_pct: 11.0,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 1.20,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['chocolate', 'bitter', 'complex', 'rich'],
      primary_function: 'Provides chocolate flavor, cocoa butter richness, and slight sweetness.',
      interactions: [
        { ingredient: 'butter', effect: 'Cocoa butter and dairy fat create smooth ganache', notes: 'Ratio determines firmness' },
        { ingredient: 'cream', effect: 'Emulsifies into stable ganache', notes: '1:1 ratio for pourable, 2:1 for truffle' },
        { ingredient: 'heat', effect: 'Melts 88-93°F (31-34°C)', notes: 'Can seize if water added while melting' },
        { ingredient: 'eggs', effect: 'Creates rich chocolate custards', notes: 'Protein sets around chocolate' }
      ],
      substitution_ratio: [
        { substitute: 'cocoa powder', ratio: '1 oz = 3 tbsp cocoa + 1 tbsp fat + 1 tbsp sugar', notes: 'Approximate, depends on % cacao' },
        { substitute: 'milk chocolate', ratio: '1:1', notes: 'Sweeter, less intense flavor' }
      ],
      temperature_sensitivity: 'Melts 88-93°F (31-34°C). Seizes if water droplets contact melted chocolate. Burns above 120°F (49°C). Tempering required for coating: heat to 115°F, cool to 80°F, reheat to 88-90°F. Blooms (white streaks) from temperature fluctuation or moisture.',
      source_notes: 'USDA FoodData Central (FDC ID: 170273), Modernist Cuisine, based on 70% cacao content',
      confidence_level: 'verified'
    }
  ];

  // DAIRY
  const dairy = [
    {
      name: 'Cream Cheese',
      category: 'dairy',
      description: 'Soft, mild-tasting fresh cheese with ~33% fat, adds tang and richness to baking.',
      water_content_pct: 54.4,
      protein_content_pct: 5.9,
      fat_content_pct: 34.2,
      starch_content_pct: 0.0,
      sugar_content_pct: 3.2,
      fiber_content_pct: 0.0,
      ph_level_min: 4.4,
      ph_level_max: 4.9,
      density_g_per_ml: 1.05,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['tangy', 'mild', 'creamy', 'rich'],
      primary_function: 'Adds moisture, richness, and tang; creates dense, tender texture in cheesecakes and frostings.',
      interactions: [
        { ingredient: 'sugar', effect: 'Smooths into frosting', notes: 'Classic cream cheese frosting' },
        { ingredient: 'eggs', effect: 'Emulsifies into cheesecake batter', notes: 'Room temp cream cheese blends smoothly' },
        { ingredient: 'butter', effect: 'Enriches dough for Danish and croissants', notes: 'Laminated doughs' },
        { ingredient: 'heat', effect: 'Melts and can curdle at high heat', notes: 'Gentle heat for cheesecakes (water bath)' }
      ],
      substitution_ratio: [
        { substitute: 'mascarpone', ratio: '1:1', notes: 'Richer, less tangy' },
        { substitute: 'Greek yogurt', ratio: '1:1', notes: 'Lower fat, more tang' },
        { substitute: 'Neufchâtel', ratio: '1:1', notes: 'Lower fat version of cream cheese' }
      ],
      temperature_sensitivity: 'Must be room temp (65-70°F) for smooth mixing. Curdles above 180°F (82°C) in direct heat. Separates if overbeaten. Slightly acidic (pH 4.4-4.9) from lactic acid fermentation. Freezes poorly (grainy texture).',
      source_notes: 'USDA FoodData Central (FDC ID: 173418), baking consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Sour Cream',
      category: 'dairy',
      description: 'Cultured cream with lactic acid bacteria, ~20% fat, adds tang and moisture.',
      water_content_pct: 71.0,
      protein_content_pct: 2.4,
      fat_content_pct: 19.5,
      starch_content_pct: 0.0,
      sugar_content_pct: 3.5,
      fiber_content_pct: 0.0,
      ph_level_min: 4.4,
      ph_level_max: 4.6,
      density_g_per_ml: 1.02,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: true,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['tangy', 'sour', 'creamy', 'rich'],
      primary_function: 'Adds moisture, tenderness, and tang; reacts with baking soda for leavening.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Acid reacts with soda for CO2', notes: 'Classic pairing in coffee cakes' },
        { ingredient: 'flour', effect: 'Acid tenderizes gluten', notes: 'Very tender cakes and muffins' },
        { ingredient: 'butter', effect: 'Adds additional richness', notes: 'Sour cream pound cake' },
        { ingredient: 'heat', effect: 'Can curdle at high heat', notes: 'Fold in gently, do not boil' }
      ],
      substitution_ratio: [
        { substitute: 'Greek yogurt', ratio: '1:1', notes: 'Similar tang and thickness' },
        { substitute: 'buttermilk', ratio: '1:1', notes: 'Thinner but same acidity' },
        { substitute: 'cream cheese + milk', ratio: '3/4 cup cream cheese + 1/4 cup milk per cup', notes: 'Similar richness' }
      ],
      temperature_sensitivity: 'Curdles above 180°F (82°C). Acid (pH 4.4-4.6) from lactic acid fermentation. Fat content prevents complete separation. Best added at end of cooking. Freezes poorly.',
      source_notes: 'USDA FoodData Central (FDC ID: 170883), baking consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Plain Yogurt',
      category: 'dairy',
      description: 'Cultured milk with live bacteria, ~3.5% fat (whole milk yogurt), tangy and thick.',
      water_content_pct: 87.9,
      protein_content_pct: 3.5,
      fat_content_pct: 3.3,
      starch_content_pct: 0.0,
      sugar_content_pct: 4.7,
      fiber_content_pct: 0.0,
      ph_level_min: 4.0,
      ph_level_max: 4.6,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['tangy', 'sour', 'creamy', 'clean'],
      primary_function: 'Adds moisture, tenderness, and tang; reacts with baking soda; lower fat than sour cream.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Acid reacts for leavening', notes: 'Essential in yogurt-based quick breads' },
        { ingredient: 'flour', effect: 'Tenderizes via acidity', notes: 'Moist, tender crumb' },
        { ingredient: 'fruit', effect: 'Pairs well in muffins and cakes', notes: 'Balances sweetness' },
        { ingredient: 'heat', effect: 'Can separate if boiled', notes: 'Fold in gently' }
      ],
      substitution_ratio: [
        { substitute: 'sour cream', ratio: '1:1', notes: 'Richer, slightly less tang' },
        { substitute: 'buttermilk', ratio: '1:1', notes: 'Thinner consistency' },
        { substitute: 'milk + lemon juice', ratio: '1 cup milk + 1 tbsp lemon juice', notes: 'Similar acidity but less thick' }
      ],
      temperature_sensitivity: 'Proteins can curdle above 180°F (82°C). Very acidic (pH 4.0-4.6). Greek yogurt is strained for thickness. Full-fat yogurt more stable than low-fat. Probiotics die above 115°F but acid remains.',
      source_notes: 'USDA FoodData Central (FDC ID: 170903), food science consensus',
      confidence_level: 'verified'
    }
  ];

  // EXTRACTS
  const extracts = [
    {
      name: 'Pure Vanilla Extract',
      category: 'extract',
      description: 'Vanilla beans extracted in alcohol, concentrated flavor enhancer used in nearly all baking.',
      water_content_pct: 47.0,
      protein_content_pct: 0.1,
      fat_content_pct: 0.1,
      starch_content_pct: 0.0,
      sugar_content_pct: 12.7,
      fiber_content_pct: 0.0,
      ph_level_min: 4.0,
      ph_level_max: 5.0,
      density_g_per_ml: 0.880,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['vanilla', 'sweet', 'floral', 'complex', 'warm'],
      primary_function: 'Enhances and rounds out sweetness, adds depth and complexity to baked goods.',
      interactions: [
        { ingredient: 'sugar', effect: 'Amplifies and complements sweetness', notes: 'Universal pairing' },
        { ingredient: 'chocolate', effect: 'Enhances chocolate flavor', notes: 'Essential in brownies and chocolate cakes' },
        { ingredient: 'dairy', effect: 'Vanilla and cream classic pairing', notes: 'Custards, ice cream, cakes' },
        { ingredient: 'heat', effect: 'Volatile compounds can evaporate', notes: 'Add near end of cooking when possible' }
      ],
      substitution_ratio: [
        { substitute: 'vanilla bean paste', ratio: '1:1', notes: 'More intense, includes seeds' },
        { substitute: 'vanilla bean', ratio: '1 bean = 1 tbsp extract', notes: 'Scrape seeds, steep pod' },
        { substitute: 'imitation vanilla', ratio: '1:1', notes: 'Synthetic vanillin, less complex' }
      ],
      temperature_sensitivity: 'Alcohol evaporates above 173°F (78°C), concentrating flavor. Vanillin (main compound) stable at baking temps. Adds minimal liquid (35% alcohol, 65% water). Pure extract superior to imitation for complex flavor.',
      source_notes: 'USDA FoodData Central (FDC ID: 171326), food science consensus, typical use 1-2 tsp per batch',
      confidence_level: 'verified'
    },
    {
      name: 'Almond Extract',
      category: 'extract',
      description: 'Concentrated almond flavor in alcohol, very potent, used sparingly.',
      water_content_pct: 55.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 4.5,
      ph_level_max: 5.5,
      density_g_per_ml: 0.900,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['almond', 'marzipan', 'intense', 'sweet'],
      primary_function: 'Provides intense almond flavor, complements vanilla, enhances nutty flavors.',
      interactions: [
        { ingredient: 'vanilla', effect: 'Classic pairing, each enhances the other', notes: 'Often used together in sugar cookies' },
        { ingredient: 'cherry', effect: 'Traditional pairing in cherry desserts', notes: 'Cherry pie, cherry cake' },
        { ingredient: 'chocolate', effect: 'Enhances chocolate complexity', notes: 'Chocolate almond torte' },
        { ingredient: 'fruit', effect: 'Complements stone fruits especially', notes: 'Peach, apricot, plum' }
      ],
      substitution_ratio: [
        { substitute: 'vanilla extract', ratio: '4:1', notes: 'Use 4x vanilla for similar sweetness, different flavor' },
        { substitute: 'amaretto liqueur', ratio: '1:4', notes: 'Use 4x amaretto for similar flavor' }
      ],
      temperature_sensitivity: 'Very potent - typically use 1/4-1/2 tsp per batch. Alcohol-based so volatile compounds evaporate with heat. Benzaldehyde (key flavor) stable at baking temps. Pure extract contains bitter almond oil (no actual almonds).',
      source_notes: 'Food science consensus, culinary tradition, use sparingly due to intensity',
      confidence_level: 'verified'
    }
  ];

  // ACIDS - 2 ingredients
  const acids = [
    {
      name: 'White Vinegar',
      category: 'acid',
      description: 'Diluted acetic acid (5-7%), provides acidity to activate baking soda and tenderize gluten.',
      water_content_pct: 94.0,
      protein_content_pct: 0.0,
      fat_content_pct: 0.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 2.4,
      ph_level_max: 2.6,
      density_g_per_ml: 1.01,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['sour', 'sharp', 'acidic', 'clean'],
      primary_function: 'Provides acidity to activate baking soda (CO2 production), tenderizes gluten, adds tanginess.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Reacts to produce CO2 gas for leavening', notes: '1 tsp baking soda needs ~1 tbsp acid' },
        { ingredient: 'flour', effect: 'Weakens gluten bonds, creates tender crumb', notes: 'Especially useful in cakes and quick breads' },
        { ingredient: 'dairy', effect: 'Can curdle milk proteins', notes: 'Creates vegan "buttermilk": 1 tbsp vinegar + 1 cup milk' },
        { ingredient: 'eggs', effect: 'Denatures proteins, stabilizes meringues', notes: 'Small amount aids egg white whipping' }
      ],
      substitution_ratio: [
        { substitute: 'lemon juice', ratio: '1:1', notes: 'Similar acidity, adds citrus flavor' },
        { substitute: 'cream of tartar', ratio: '2:1', notes: 'Use 2 tsp cream of tartar per 1 tbsp vinegar' },
        { substitute: 'buttermilk', ratio: '1:8', notes: '1 tbsp vinegar ≈ 1 cup buttermilk for acidity' }
      ],
      temperature_sensitivity: 'Acetic acid (boiling point 244°F/118°C) partially evaporates during baking, reducing tanginess. Reaction with baking soda is immediate and releases CO2 quickly, so mix just before baking. In cakes, creates tender crumb by preventing excessive gluten development.',
      source_notes: 'Food chemistry consensus, typical use 1-2 tbsp per batch for leavening or flavor',
      confidence_level: 'verified'
    },
    {
      name: 'Lemon Juice',
      category: 'acid',
      description: 'Fresh or bottled citric acid solution (~5-6%), provides tartness and activates baking soda.',
      water_content_pct: 92.0,
      protein_content_pct: 0.4,
      fat_content_pct: 0.2,
      starch_content_pct: 0.0,
      sugar_content_pct: 2.5,
      fiber_content_pct: 0.0,
      ph_level_min: 2.0,
      ph_level_max: 2.6,
      density_g_per_ml: 1.03,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['citrus', 'tart', 'bright', 'fresh', 'acidic'],
      primary_function: 'Provides acidity for leavening with baking soda, adds citrus flavor, tenderizes gluten, prevents oxidation.',
      interactions: [
        { ingredient: 'baking soda', effect: 'Rapid CO2 production for leavening', notes: '1 tsp baking soda needs ~1-2 tbsp lemon juice' },
        { ingredient: 'flour', effect: 'Weakens gluten, creates tender texture', notes: 'Especially useful in lemon cakes and scones' },
        { ingredient: 'fruit', effect: 'Prevents enzymatic browning', notes: 'Keeps apples, pears from oxidizing' },
        { ingredient: 'dairy', effect: 'Curdles milk to create vegan buttermilk', notes: '1 tbsp lemon juice + 1 cup milk, let sit 5 min' },
        { ingredient: 'sugar', effect: 'Balances sweetness with acidity', notes: 'Lemon bars, lemon meringue pie' }
      ],
      substitution_ratio: [
        { substitute: 'white vinegar', ratio: '1:1', notes: 'Same acidity, less flavor complexity' },
        { substitute: 'lime juice', ratio: '1:1', notes: 'Similar acidity, different citrus profile' },
        { substitute: 'citric acid powder', ratio: '1/4 tsp powder = 1 tbsp juice', notes: 'Dissolve in water' }
      ],
      temperature_sensitivity: 'Citric acid stable at baking temps. Volatile citrus oils provide fresh aroma but degrade with prolonged heat. Fresh juice preferred over bottled for maximum flavor. Typical use: 1-3 tbsp per batch for leavening or flavor.',
      source_notes: 'USDA FoodData Central (FDC ID: 167747), food science consensus',
      confidence_level: 'verified'
    }
  ];

  // SPICES - 2 ingredients
  const spices = [
    {
      name: 'Ground Cinnamon',
      category: 'spice',
      description: 'Dried, ground bark of cinnamon tree, adds warmth and sweetness to baked goods.',
      water_content_pct: 10.0,
      protein_content_pct: 4.0,
      fat_content_pct: 1.2,
      starch_content_pct: 0.0,
      sugar_content_pct: 2.2,
      fiber_content_pct: 53.1,
      ph_level_min: 5.0,
      ph_level_max: 6.0,
      density_g_per_ml: 0.56,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['warm', 'sweet', 'spicy', 'aromatic', 'woody'],
      primary_function: 'Provides warm, sweet flavor and aroma, enhances perception of sweetness, complements fruit and chocolate.',
      interactions: [
        { ingredient: 'sugar', effect: 'Amplifies perceived sweetness', notes: 'Allows sugar reduction by 10-15%' },
        { ingredient: 'fruit', effect: 'Classic pairing with apples, pears, stone fruits', notes: 'Apple pie, peach cobbler' },
        { ingredient: 'chocolate', effect: 'Adds complexity to chocolate desserts', notes: 'Cinnamon brownies, Mexican hot chocolate' },
        { ingredient: 'dairy', effect: 'Mellows in cream-based preparations', notes: 'Cinnamon rolls, horchata' },
        { ingredient: 'yeast', effect: 'No interference with fermentation', notes: 'Safe for cinnamon rolls, babka' }
      ],
      substitution_ratio: [
        { substitute: 'cinnamon stick', ratio: '1 stick = 1/2 tsp ground', notes: 'Infuse in liquids, remove before baking' },
        { substitute: 'allspice', ratio: '1:1', notes: 'Different but compatible warm spice' },
        { substitute: 'cardamom', ratio: '1:2', notes: 'Use half as much, more intense' }
      ],
      temperature_sensitivity: 'Cinnamaldehyde (main compound) stable at baking temps. Volatile oils can dissipate with prolonged heat. Typical use: 1-3 tsp per batch. Ceylon cinnamon sweeter, milder than Cassia. Adds no significant moisture or structure.',
      source_notes: 'USDA FoodData Central (FDC ID: 171320), culinary tradition',
      confidence_level: 'verified'
    },
    {
      name: 'Ground Nutmeg',
      category: 'spice',
      description: 'Dried, ground seed of nutmeg tree, adds warm, sweet, slightly medicinal flavor.',
      water_content_pct: 6.2,
      protein_content_pct: 5.8,
      fat_content_pct: 36.3,
      starch_content_pct: 0.0,
      sugar_content_pct: 2.9,
      fiber_content_pct: 20.8,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.45,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['warm', 'sweet', 'nutty', 'slightly bitter', 'aromatic'],
      primary_function: 'Provides warm, complex flavor, complements dairy and egg-based desserts, enhances spice blends.',
      interactions: [
        { ingredient: 'dairy', effect: 'Classic pairing with cream, milk, custard', notes: 'Eggnog, crème brûlée, rice pudding' },
        { ingredient: 'eggs', effect: 'Enhances custard flavor', notes: 'Pumpkin pie, bread pudding' },
        { ingredient: 'cinnamon', effect: 'Complementary spice pairing', notes: 'Often used together in fall desserts' },
        { ingredient: 'vanilla', effect: 'Enhances vanilla sweetness', notes: 'Snickerdoodles, sugar cookies' },
        { ingredient: 'fruit', effect: 'Complements pumpkin, sweet potato, apple', notes: 'Pumpkin pie, sweet potato casserole' }
      ],
      substitution_ratio: [
        { substitute: 'mace', ratio: '1:1', notes: 'Mace is nutmeg outer coating, similar flavor' },
        { substitute: 'allspice', ratio: '1:1', notes: 'Different but compatible' },
        { substitute: 'cinnamon', ratio: '1:2', notes: 'Use double cinnamon, less complex' }
      ],
      temperature_sensitivity: 'Myristicin (main compound) stable at baking temps. Very potent - use sparingly (1/4-1/2 tsp per batch). Freshly grated nutmeg more aromatic than pre-ground. Adds minimal moisture. High fat content but used in such small quantities it does not affect texture.',
      source_notes: 'USDA FoodData Central (FDC ID: 170931), culinary tradition',
      confidence_level: 'verified'
    }
  ];
  // OILS - 2 ingredients
  const oils = [
    {
      name: 'Vegetable Oil',
      category: 'oil',
      description: 'Neutral-flavored refined oil (soybean, canola, or blend), creates tender texture in cakes and quick breads.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 7.0,
      ph_level_max: 7.0,
      density_g_per_ml: 0.92,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'clean', 'mild'],
      primary_function: 'Tenderizes crumb by coating flour proteins (preventing gluten formation), adds moisture, carries fat-soluble flavors.',
      interactions: [
        { ingredient: 'flour', effect: 'Coats proteins, inhibits gluten development', notes: 'Creates tender cakes vs. chewy breads' },
        { ingredient: 'sugar', effect: 'Helps dissolve and distribute sugar', notes: 'Oil cakes stay moist longer' },
        { ingredient: 'eggs', effect: 'Emulsifies with egg proteins', notes: 'Creates smooth batter' },
        { ingredient: 'cocoa', effect: 'Helps bloom chocolate flavor', notes: 'Fat-soluble compounds extracted' }
      ],
      substitution_ratio: [
        { substitute: 'melted butter', ratio: '1:1', notes: 'Adds flavor, similar moisture' },
        { substitute: 'applesauce', ratio: '1:1', notes: 'Lower fat, denser texture' },
        { substitute: 'olive oil', ratio: '1:1', notes: 'Adds fruity flavor' }
      ],
      temperature_sensitivity: 'Smoke point ~400-450°F (204-232°C), well above baking temps. Does not solidify like butter at room temp, keeping cakes moist. Neutral flavor won\'t compete with other ingredients. Typical use: 1/4-1/2 cup per batch in cakes.',
      source_notes: 'USDA FoodData Central (FDC ID: 171028), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Extra Virgin Olive Oil',
      category: 'oil',
      description: 'Fruity, robust oil from pressed olives, adds distinct flavor to Mediterranean and savory baked goods.',
      water_content_pct: 0.0,
      protein_content_pct: 0.0,
      fat_content_pct: 100.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 6.5,
      ph_level_max: 7.5,
      density_g_per_ml: 0.91,
      standard_measurement_unit: 'volume',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['fruity', 'peppery', 'grassy', 'robust', 'complex'],
      primary_function: 'Adds fruity flavor and tender texture, especially in olive oil cakes, focaccia, and Mediterranean desserts.',
      interactions: [
        { ingredient: 'citrus', effect: 'Complements lemon, orange flavors', notes: 'Olive oil lemon cake classic' },
        { ingredient: 'herbs', effect: 'Enhances rosemary, thyme, basil', notes: 'Savory focaccia, herb breads' },
        { ingredient: 'flour', effect: 'Tenderizes by coating proteins', notes: 'Same mechanism as other oils' },
        { ingredient: 'sugar', effect: 'Balances fruity bitterness', notes: 'Sweetness mellows peppery notes' }
      ],
      substitution_ratio: [
        { substitute: 'vegetable oil', ratio: '1:1', notes: 'Neutral flavor instead of fruity' },
        { substitute: 'melted butter', ratio: '1:1', notes: 'Richer, less fruity' }
      ],
      temperature_sensitivity: 'Smoke point ~350-410°F (177-210°C) depending on quality. Extra virgin can smoke at lower temps than refined oils. Flavor compounds can turn bitter if overheated. Best in cakes baked at 350°F or lower. Typical use: 1/3-1/2 cup per batch.',
      source_notes: 'USDA FoodData Central (FDC ID: 171413), Mediterranean baking tradition',
      confidence_level: 'verified'
    }
  ];

  // NUTS (Almond Flour is listed under flours)
  const nuts = [
    {
      name: 'Chopped Walnuts',
      category: 'nut',
      description: 'Coarsely chopped walnut pieces, adds crunch, rich flavor, and omega-3 fats to baked goods.',
      water_content_pct: 4.1,
      protein_content_pct: 15.2,
      fat_content_pct: 65.2,
      starch_content_pct: 0.0,
      sugar_content_pct: 2.6,
      fiber_content_pct: 6.7,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.50,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['nutty', 'earthy', 'slightly bitter', 'rich'],
      primary_function: 'Adds crunchy texture, nutty flavor, and richness. Toasting enhances flavor and aroma.',
      interactions: [
        { ingredient: 'banana', effect: 'Classic pairing in banana bread', notes: 'Sweetness balances walnut bitterness' },
        { ingredient: 'chocolate', effect: 'Nutty richness complements chocolate', notes: 'Brownies, chocolate chip cookies' },
        { ingredient: 'cinnamon', effect: 'Warm spice enhances nutty flavor', notes: 'Coffee cakes, cinnamon rolls' },
        { ingredient: 'maple', effect: 'Sweetness complements earthy notes', notes: 'Maple walnut bread, cookies' }
      ],
      substitution_ratio: [
        { substitute: 'pecans', ratio: '1:1', notes: 'Sweeter, less bitter' },
        { substitute: 'almonds', ratio: '1:1', notes: 'Milder flavor, firmer texture' },
        { substitute: 'chocolate chips', ratio: '1:1', notes: 'Completely different flavor, similar textural contrast' }
      ],
      temperature_sensitivity: 'Toast at 350°F for 8-10 minutes to enhance flavor. High fat means can burn quickly - add partway through baking if crust browns too fast. Typical use: 1/2-1 cup per batch. Store refrigerated or frozen to prevent rancidity.',
      source_notes: 'USDA FoodData Central (FDC ID: 170187), culinary tradition',
      confidence_level: 'verified'
    }
  ];

  // THICKENERS - 2 ingredients
  const thickeners = [
    {
      name: 'Unflavored Gelatin',
      category: 'thickener',
      description: 'Protein derived from animal collagen, sets liquids into gels, stabilizes mousses and creams.',
      water_content_pct: 13.0,
      protein_content_pct: 85.6,
      fat_content_pct: 0.1,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 0.0,
      ph_level_min: 6.0,
      ph_level_max: 7.0,
      density_g_per_ml: 0.70,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'odorless'],
      primary_function: 'Creates gel structure by forming protein network when cooled, stabilizes foams and emulsions.',
      interactions: [
        { ingredient: 'liquid', effect: 'Blooms (hydrates) in cold liquid, dissolves in hot liquid', notes: '1 envelope (7g) sets 2 cups liquid' },
        { ingredient: 'acid', effect: 'Acid weakens gel strength', notes: 'Use extra gelatin with citrus' },
        { ingredient: 'fresh pineapple/kiwi', effect: 'Enzymes prevent gelling', notes: 'Use canned fruit (heat denatures enzymes)' },
        { ingredient: 'sugar', effect: 'High sugar can interfere with gel formation', notes: 'Adjust gelatin amount' }
      ],
      substitution_ratio: [
        { substitute: 'agar agar', ratio: '1:1 by weight', notes: 'Vegan, sets firmer, at room temp' },
        { substitute: 'pectin', ratio: '1:1', notes: 'Plant-based, needs sugar and acid' }
      ],
      temperature_sensitivity: 'Blooms in cold water 5-10 min. Dissolves in liquid above 122°F (50°C). Sets when cooled below 59°F (15°C). Melts again if reheated above 95°F (35°C). 1 envelope (7g/2.5 tsp) = 1 tbsp. Typical use: 1-2 envelopes per batch for mousses, panna cotta.',
      source_notes: 'USDA FoodData Central (FDC ID: 169599), food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Agar Agar Powder',
      category: 'thickener',
      description: 'Plant-based gelling agent from seaweed, vegan gelatin alternative, sets at room temperature.',
      water_content_pct: 10.0,
      protein_content_pct: 6.2,
      fat_content_pct: 0.3,
      starch_content_pct: 0.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 80.0,
      ph_level_min: 6.5,
      ph_level_max: 7.5,
      density_g_per_ml: 0.60,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral', 'odorless'],
      primary_function: 'Creates firm gel structure, vegan alternative to gelatin, stabilizes desserts and glazes.',
      interactions: [
        { ingredient: 'liquid', effect: 'Dissolves in boiling liquid, sets when cooled to room temp', notes: '1 tsp sets 1 cup liquid' },
        { ingredient: 'acid', effect: 'Stable in acidic conditions (unlike gelatin)', notes: 'Great for citrus desserts' },
        { ingredient: 'fruit enzymes', effect: 'Not affected by fresh pineapple/kiwi', notes: 'Can use fresh tropical fruits' },
        { ingredient: 'sugar', effect: 'Less affected by sugar than gelatin', notes: 'More forgiving ratios' }
      ],
      substitution_ratio: [
        { substitute: 'gelatin', ratio: '1:8', notes: 'Use 1 tsp agar per 8 tsp (2.5 envelopes) gelatin' },
        { substitute: 'pectin', ratio: '1:1', notes: 'Different texture, needs sugar/acid' }
      ],
      temperature_sensitivity: 'Must boil (212°F/100°C) to fully dissolve. Sets at 90-104°F (32-40°C), much higher than gelatin (59°F). Sets firmer and more brittle than gelatin. Does not melt at room temp once set. Typical use: 1-2 tsp per cup liquid. Powder form most common (flakes and bars also available).',
      source_notes: 'Food science consensus, vegan baking resources, seaweed extract properties',
      confidence_level: 'verified'
    }
  ];

  const crackers = [
    {
      name: 'Graham Cracker Crumbs',
      category: 'cracker',
      description:
        'Sweet whole-wheat cracker crumbs used for pie and cheesecake crusts; binds with melted butter.',
      water_content_pct: 3.5,
      protein_content_pct: 7.0,
      fat_content_pct: 10.0,
      starch_content_pct: 72.0,
      sugar_content_pct: 20.0,
      fiber_content_pct: 4.0,
      ph_level_min: 6.0,
      ph_level_max: 6.8,
      density_g_per_ml: 0.45,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['honey', 'wheat', 'sweet', 'toasted'],
      primary_function:
        'Provides crisp crumb structure for press-in crusts when combined with fat; no gluten network.',
      interactions: [
        { ingredient: 'butter', effect: 'Fat coats crumbs and sets when chilled', notes: 'Classic cheesecake crust' },
        { ingredient: 'heat', effect: 'Toasts and sets crust', notes: 'Pre-bake 8–12 min before wet fillings' },
        { ingredient: 'moisture', effect: 'Absorbs liquid from fillings if under-baked', notes: 'Pre-bake and cool crust' }
      ],
      substitution_ratio: [
        { substitute: 'digestive biscuit crumbs', ratio: '1:1', notes: 'Less honey flavor' },
        { substitute: 'vanilla wafer crumbs', ratio: '1:1', notes: 'Milder, sweeter crust' }
      ],
      temperature_sensitivity:
        'Dry crumbs toast 300–350°F (150–177°C). Butter melts ~90°F (32°C); crust firms when cooled.',
      source_notes: 'USDA FoodData Central (graham crackers, crushed), food science consensus',
      confidence_level: 'verified'
    }
  ];

  const enrichments = [
    {
      name: 'Diastatic Malt Powder',
      category: 'enrichment',
      description: 'Sprouted barley malt; provides enzymes and sugars for yeast activity and crust color in lean breads.',
      water_content_pct: 5.0,
      protein_content_pct: 10.0,
      fat_content_pct: 1.5,
      starch_content_pct: 70.0,
      sugar_content_pct: 10.0,
      fiber_content_pct: 2.0,
      ph_level_min: 5.5,
      ph_level_max: 6.5,
      density_g_per_ml: 0.55,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['malty', 'sweet', 'mild'],
      primary_function: 'Feeds yeast and improves browning in lean doughs; typical 0.5–2% of flour weight.',
      interactions: [
        { ingredient: 'yeast', effect: 'Provides fermentable sugars', notes: 'Common in baguettes and sandwich loaves' },
        { ingredient: 'flour', effect: 'Enzymes break starch to sugars', notes: 'Use sparingly' }
      ],
      substitution_ratio: [
        { substitute: 'non-diastatic malt', ratio: '1:1', notes: 'Color/flavor only, less enzyme activity' },
        { substitute: 'honey', ratio: '1:1 by weight', notes: 'Different flavor, also feeds yeast' }
      ],
      temperature_sensitivity: 'Enzyme activity reduced above ~140°F (60°C) during bake.',
      source_notes: 'Food science consensus, artisan bread references',
      confidence_level: 'community'
    },
    {
      name: 'Vital Wheat Gluten',
      category: 'enrichment',
      description: 'Concentrated wheat gluten protein; strengthens low-protein or whole-grain doughs.',
      water_content_pct: 8.0,
      protein_content_pct: 75.0,
      fat_content_pct: 2.0,
      starch_content_pct: 5.0,
      sugar_content_pct: 0.0,
      fiber_content_pct: 1.0,
      ph_level_min: 6.0,
      ph_level_max: 7.0,
      density_g_per_ml: 0.6,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: null,
      flavor_profile: ['neutral'],
      primary_function: 'Increases dough strength and gas retention; typical 1–2% of flour in whole wheat or rye blends.',
      interactions: [
        { ingredient: 'water', effect: 'Absorbs water strongly', notes: 'May need slightly higher hydration' },
        { ingredient: 'whole wheat flour', effect: 'Compensates for weaker gluten', notes: 'Common pairing' }
      ],
      substitution_ratio: [{ substitute: 'bread flour', ratio: 'N/A', notes: 'Use higher-protein flour instead of adding VWG' }],
      temperature_sensitivity: 'Protein sets with heat like gluten in flour.',
      source_notes: 'Food science consensus',
      confidence_level: 'verified'
    },
    {
      name: 'Nonfat Dry Milk Powder',
      category: 'dairy',
      description: 'Dehydrated skim milk solids; adds protein, lactose, and browning to dough and pastry.',
      water_content_pct: 3.0,
      protein_content_pct: 36.0,
      fat_content_pct: 1.0,
      starch_content_pct: 0.0,
      sugar_content_pct: 52.0,
      fiber_content_pct: 0.0,
      ph_level_min: 6.5,
      ph_level_max: 7.0,
      density_g_per_ml: 0.55,
      standard_measurement_unit: 'weight',
      gluten_forming: false,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: true,
      typical_hydration_ratio: null,
      flavor_profile: ['dairy', 'mild', 'sweet'],
      primary_function: 'Softens crumb and promotes Maillard browning; typical 2–5% of flour.',
      interactions: [
        { ingredient: 'yeast', effect: 'Lactose ferments slowly', notes: 'Milk breads often use scalded milk or powder' },
        { ingredient: 'sugar', effect: 'Adds sweetness and solids', notes: 'Enriched doughs' }
      ],
      substitution_ratio: [
        { substitute: 'milk', ratio: '1:8 powder to liquid milk by weight', notes: 'Adjust hydration' }
      ],
      temperature_sensitivity: 'Browns readily due to milk proteins and lactose.',
      source_notes: 'USDA FoodData Central (dry milk), baking references',
      confidence_level: 'verified'
    },
    {
      name: 'Sourdough Starter',
      category: 'leavener',
      description: 'Fermented flour-and-water culture (typical 100% hydration); biological leavening and acid development.',
      water_content_pct: 50.0,
      protein_content_pct: 5.0,
      fat_content_pct: 0.5,
      starch_content_pct: 20.0,
      sugar_content_pct: 1.0,
      fiber_content_pct: 1.0,
      ph_level_min: 3.8,
      ph_level_max: 4.5,
      density_g_per_ml: 1.05,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: 'biological',
      hygroscopic: false,
      typical_hydration_ratio: 100.0,
      flavor_profile: ['tangy', 'complex', 'fermented'],
      primary_function: 'Leavens bread via wild yeast and bacteria; contributes acid for flavor and gluten conditioning.',
      interactions: [
        { ingredient: 'flour', effect: 'Contributes flour and water to total formula', notes: 'Baker’s % must include starter flour/water' },
        { ingredient: 'commercial yeast', effect: 'Often combined in hybrid loaves', notes: 'Adjust yeast down' }
      ],
      substitution_ratio: [
        { substitute: 'commercial yeast', ratio: 'Not 1:1', notes: 'Requires formula redesign' }
      ],
      temperature_sensitivity: 'Activity peaks around 75–85°F (24–29°C); slows in refrigerator.',
      source_notes: 'Food science consensus; assume 100% hydration ripe starter',
      confidence_level: 'community'
    },
    {
      name: 'Semolina Flour',
      category: 'flour',
      description: 'Coarse durum wheat flour; used for dusting, pasta, and some artisan breads.',
      water_content_pct: 11.0,
      protein_content_pct: 13.0,
      fat_content_pct: 1.5,
      starch_content_pct: 72.0,
      sugar_content_pct: 0.5,
      fiber_content_pct: 3.0,
      ph_level_min: 6.0,
      ph_level_max: 7.0,
      density_g_per_ml: 0.6,
      standard_measurement_unit: 'weight',
      gluten_forming: true,
      emulsifying: false,
      leavening_type: null,
      hygroscopic: false,
      typical_hydration_ratio: 62.0,
      flavor_profile: ['nutty', 'wheaty', 'golden'],
      primary_function: 'Adds color and texture; often used to dust peels and couche to reduce sticking.',
      interactions: [
        { ingredient: 'water', effect: 'Absorbs water more slowly than fine AP flour', notes: 'Adjust mix time' },
        { ingredient: 'bread dough', effect: 'Dusting only — not usually in bulk formula', notes: 'Rice flour also used for dusting' }
      ],
      substitution_ratio: [
        { substitute: 'rice flour', ratio: '1:1 for dusting', notes: 'For couche/banneton only' }
      ],
      temperature_sensitivity: 'High protein durum; strong but less elastic than bread flour.',
      source_notes: 'USDA FoodData Central (semolina), food science consensus',
      confidence_level: 'verified'
    }
  ];

  // Combine all ingredients
  const allIngredients = [
    ...flours,
    ...eggs,
    ...fats,
    ...sugars,
    ...leaveners,
    ...liquids,
    ...salts,
    ...starches,
    ...chocolates,
    ...dairy,
    ...extracts,
    ...acids,
    ...spices,
    ...oils,
    ...nuts,
    ...thickeners,
    ...crackers,
    ...enrichments
  ];

  const catalogByName = new Map<string, (typeof allIngredients)[number]>();
  for (const ingredient of allIngredients) {
    if (catalogByName.has(ingredient.name)) {
      console.warn(`⚠️ Duplicate catalog name skipped: ${ingredient.name}`);
      continue;
    }
    catalogByName.set(ingredient.name, ingredient);
  }
  const catalog = [...catalogByName.values()];

  for (const ingredient of catalog) {
    await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      create: ingredient,
      update: ingredient
    });
  }

  console.log(`✅ Synced ${catalog.length} ingredients`);
  console.log(`   - ${flours.length} flours`);
  console.log(`   - ${eggs.length} egg types`);
  console.log(`   - ${fats.length} fats`);
  console.log(`   - ${sugars.length} sugars`);
  console.log(`   - ${leaveners.length} leaveners`);
  console.log(`   - ${liquids.length} liquids`);
  console.log(`   - ${salts.length} salts`);
  console.log(`   - ${starches.length} starches`);
  console.log(`   - ${chocolates.length} chocolates`);
  console.log(`   - ${dairy.length} dairy products`);
  console.log(`   - ${extracts.length} extracts`);
  console.log(`   - ${acids.length} acids`);
  console.log(`   - ${spices.length} spices`);
  console.log(`   - ${oils.length} oils`);
  console.log(`   - ${nuts.length} nuts`);
  console.log(`   - ${thickeners.length} thickeners`);
  console.log(`   - ${crackers.length} cracker products`);
  console.log(`   - ${enrichments.length} enrichments / specialty`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
