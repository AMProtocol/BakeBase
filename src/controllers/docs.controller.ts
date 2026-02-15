import { Request, Response } from 'express';
import { AgentGuide } from '../types';

export class DocsController {
  /**
   * GET /agents
   * Returns AI agent usage guide
   */
  static getAgentGuide(req: Request, res: Response) {
    const guide: AgentGuide = {
      api_name: 'BakeBase',
      version: '1.0.0',
      purpose: 'AI-first food science reference API focused on the functional properties of baking ingredients. Provides structured, scientifically accurate data about ingredient chemistry, interactions, and predicted baking outcomes.',
      recommended_usage: 'Use BakeBase to understand ingredient functionality, calculate hydration ratios, predict texture outcomes, and analyze ingredient combinations before baking. The /combine endpoint is the most powerful feature - it performs real chemistry calculations and returns plain-language predictions suitable for AI agent interpretation.',
      available_endpoints: [
        {
          path: 'GET /ingredients',
          method: 'GET',
          description: 'List all ingredients with optional filtering',
          when_to_use: 'Browse available ingredients, filter by category (flour, egg, fat, sugar, leavener) or search by function (e.g., "emulsifying", "leavening")'
        },
        {
          path: 'GET /ingredients/:id',
          method: 'GET',
          description: 'Get detailed information about a specific ingredient',
          when_to_use: 'Retrieve complete data including interactions, substitutions, and thermal properties for a single ingredient'
        },
        {
          path: 'GET /ingredients/search?q=',
          method: 'GET',
          description: 'Fuzzy search ingredients by name or function',
          when_to_use: 'Find ingredients when you have partial name or want to search by role (e.g., "gluten", "tender", "brown")'
        },
        {
          path: 'POST /ingredients/combine',
          method: 'POST',
          description: 'Analyze a combination of ingredients with real chemistry calculations',
          when_to_use: 'Predict baking outcome before mixing. Provide array of {ingredient_id, quantity_g} and receive hydration analysis, leavening adequacy, pH environment, texture prediction, and plain-language outcome forecast. This is the primary value-add endpoint.'
        },
        {
          path: 'GET /categories',
          method: 'GET',
          description: 'List all ingredient categories with counts',
          when_to_use: 'Understand available ingredient types and their distribution in the database'
        },
        {
          path: 'GET /health',
          method: 'GET',
          description: 'Health check endpoint',
          when_to_use: 'Verify API availability and database connectivity'
        },
        {
          path: 'GET /agents',
          method: 'GET',
          description: 'This endpoint - returns agent usage guide',
          when_to_use: 'First-time API discovery or when unsure how to use the API'
        },
        {
          path: 'GET /docs/openapi.json',
          method: 'GET',
          description: 'OpenAPI 3.0 specification',
          when_to_use: 'Generate client code or integrate with API documentation tools'
        }
      ],
      key_concepts: {
        hydration_ratio: 'The ratio of liquid to flour by weight. 70% hydration means 70g water per 100g flour. Critical for predicting dough consistency.',
        gluten_forming: 'Ingredients with proteins that form elastic networks when hydrated and mixed. Determines chewiness and structure.',
        leavening_type: 'How an ingredient creates rise: biological (yeast), chemical (baking powder/soda), mechanical (whipped eggs), or steam (water in butter).',
        typical_hydration_ratio: 'How much liquid an ingredient absorbs relative to its weight. Used in hydration calculations.',
        interactions: 'How ingredients affect each other chemically and physically (e.g., acid + baking soda = CO2, fat + flour = tenderness).',
        substitution_ratio: 'How to replace one ingredient with another, including quantity adjustments needed.',
        ph_level: 'Acid/base balance. Affects leavening reactions, gluten strength, and browning rate.',
        confidence_level: 'Data reliability: "verified" (peer-reviewed sources like USDA), "community" (baker consensus), or "inferred" (calculated estimates).'
      }
    };

    res.json(guide);
  }

  /**
   * GET /health
   * Health check endpoint
   */
  static healthCheck(req: Request, res: Response) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'BakeBase API',
      version: '1.0.0'
    });
  }
}
