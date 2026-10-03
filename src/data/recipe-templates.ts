/**
 * Reference formulations expressed in grams at a reference pan diameter.
 * Quantities scale by (to_diameter / from_diameter)² for constant batter height.
 */

export type RecipeComponent = 'filling' | 'crust';

export interface RecipeTemplateLine {
  ingredient_name: string;
  grams_at_reference: number;
  component: RecipeComponent;
}

export interface BakingStep {
  phase: string;
  instruction: string;
}

export interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  reference_pan: {
    type: 'springform';
    diameter_in: number;
  };
  lines: RecipeTemplateLine[];
  baking: {
    method: string;
    oven_temp_f: number;
    oven_temp_c: number;
    water_bath: boolean;
    doneness_cues: string[];
    cool_down: string[];
    steps: BakingStep[];
  };
  scaling_formula: string;
}

export const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'ny-cheesecake',
    name: 'New York–style baked cheesecake',
    description:
      'Dense cream-cheese custard with graham cracker crust. Reference batch fits a 9-inch springform; scale to any round springform of the same fill height using pan area math.',
    reference_pan: { type: 'springform', diameter_in: 9 },
    scaling_formula: 'grams_target = grams_reference × (target_diameter_in / reference_diameter_in)²',
    lines: [
      { ingredient_name: 'Graham Cracker Crumbs', grams_at_reference: 200, component: 'crust' },
      { ingredient_name: 'Unsalted Butter', grams_at_reference: 90, component: 'crust' },
      { ingredient_name: 'Cream Cheese', grams_at_reference: 680, component: 'filling' },
      { ingredient_name: 'Granulated White Sugar', grams_at_reference: 150, component: 'filling' },
      { ingredient_name: 'Whole Egg', grams_at_reference: 150, component: 'filling' },
      { ingredient_name: 'Sour Cream', grams_at_reference: 60, component: 'filling' },
      { ingredient_name: 'Pure Vanilla Extract', grams_at_reference: 5, component: 'filling' },
      { ingredient_name: 'Table Salt', grams_at_reference: 2, component: 'filling' }
    ],
    baking: {
      method: 'bake',
      oven_temp_f: 325,
      oven_temp_c: 163,
      water_bath: true,
      doneness_cues: [
        'Edges set (slightly puffed), center jiggles like soft custard when pan is nudged',
        'Internal center often 150°F (66°C) for a creamy set — verify with thermometer on thick pans'
      ],
      cool_down: [
        'Turn oven off, crack door 1 hour',
        'Refrigerate uncovered until fully chilled (4+ hours)',
        'Run a thin knife around springform before releasing sides'
      ],
      steps: [
        {
          phase: 'crust',
          instruction:
            'Mix scaled graham crumbs with melted butter; press into bottom of springform. Bake 10 minutes at 350°F (177°C). Cool before filling.'
        },
        {
          phase: 'filling',
          instruction:
            'Beat room-temperature cream cheese until smooth. Add sugar, then eggs one at a time, then sour cream, vanilla, and salt. Do not overmix.'
        },
        {
          phase: 'bake',
          instruction:
            'Pour filling into crust. Place springform in a larger pan; add hot water halfway up the sides. Bake at 325°F (163°C) until doneness cues are met (12-inch pans typically need longer than 9-inch).'
        }
      ]
    }
  }
];

export function panScaleFactor(fromDiameterIn: number, toDiameterIn: number): number {
  if (fromDiameterIn <= 0 || toDiameterIn <= 0) {
    throw new Error('Pan diameters must be positive');
  }
  return (toDiameterIn / fromDiameterIn) ** 2;
}

export function getRecipeTemplate(id: string): RecipeTemplate | undefined {
  return RECIPE_TEMPLATES.find((t) => t.id === id);
}
