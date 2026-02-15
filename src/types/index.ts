import { Ingredient } from '@prisma/client';

export interface IngredientInput {
  ingredient_id: string;
  quantity_g: number;
}

export interface CombinedAnalysis {
  total_weight_g: number;
  total_hydration_pct: number;
  total_protein_pct: number;
  total_fat_pct: number;
  total_sugar_pct: number;
  total_starch_pct: number;
  ph_range: {
    min: number;
    max: number;
  };
  leavening_analysis: {
    biological_present: boolean;
    chemical_present: boolean;
    mechanical_present: boolean;
    adequacy: 'none' | 'insufficient' | 'adequate' | 'excessive';
    notes: string;
  };
  hydration_analysis: {
    flour_weight_g: number;
    liquid_weight_g: number;
    hydration_ratio_pct: number;
    assessment: 'dry' | 'low' | 'normal' | 'high' | 'very_high' | 'batter';
    notes: string;
  };
  protein_interaction_summary: string;
  predicted_texture_profile: string[];
  ph_environment: string;
  prediction: string;
  warnings: string[];
  ingredients_used: Array<{
    name: string;
    quantity_g: number;
    percentage_of_total: number;
  }>;
}

export interface Meta {
  endpoint_description: string;
  field_glossary: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta: Meta;
}

export interface CategorySummary {
  category: string;
  count: number;
  examples: string[];
}

export interface AgentGuide {
  api_name: string;
  version: string;
  purpose: string;
  recommended_usage: string;
  available_endpoints: Array<{
    path: string;
    method: string;
    description: string;
    when_to_use: string;
  }>;
  key_concepts: Record<string, string>;
}

export { Ingredient };
