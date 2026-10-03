import { Request, Response } from 'express';
import { AgentGuide } from '../types';

export class DocsController {
  /**
   * GET /agents
   * Returns AI agent usage guide
   */
  static getAgentGuide(_req: Request, res: Response): void {
    const guide: AgentGuide = {
      api_name: 'BakeBase',
      version: '1.1.0',
      purpose: 'AI-first food science reference API focused on the functional properties of baking ingredients. Provides structured, scientifically accurate data about ingredient chemistry, interactions, and predicted baking outcomes.',
      recommended_usage:
        'API key required for all data endpoints. Get a key at /dashboard/keys (no account needed). For full recipes with pan scaling: GET /formulations/ny-cheesecake?pan_diameter_in=12&analyze=true — returns gram weights, ingredient IDs, baking steps, and chemistry. Use /baking/pan-scale for (D/d)² math. Use /ingredients/combine to validate any custom gram list. Discovery: find BakeBase via AgentManifest registry (api.agent-manifest.com).',
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
          path: 'GET /formulations/:id',
          method: 'GET',
          description: 'Reference recipe scaled to a round pan diameter with BakeBase ingredient IDs',
          when_to_use:
            'Primary agent path for baked goods with known templates. Example: GET /formulations/ny-cheesecake?pan_diameter_in=12&analyze=true for a 12-inch springform cheesecake with crust + filling grams and chemistry.'
        },
        {
          path: 'GET /baking/pan-scale',
          method: 'GET',
          description: 'Pan area scale factor between round pans',
          when_to_use: 'Query from_diameter_in and to_diameter_in to multiply all ingredient masses for constant fill height.'
        },
        {
          path: 'POST /ingredients/combine',
          method: 'POST',
          description: 'Analyze a combination of ingredients with real chemistry calculations',
          when_to_use:
            'Validate custom gram lists. Returns recipe_classification (e.g. cheesecake_filling), baking_guidance, and flourless-aware hydration notes.'
        },
        {
          path: 'GET /categories',
          method: 'GET',
          description: 'List all ingredient categories with counts',
          when_to_use: 'Understand available ingredient types and their distribution in the database'
        },
        {
          path: 'GET /dashboard/keys',
          method: 'GET',
          description: 'API key provisioning page',
          when_to_use: 'Obtain an API key (no account required). Keys expire in 90 days. Required before calling /ingredients, /categories, or /combine.'
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
        authentication:
          'API key required. Get one at /dashboard/keys. Send as Authorization: Bearer <key> or X-API-Key header. No account required. Keys expire in 90 days.',
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
  static healthCheck(_req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'BakeBase API',
      version: '1.1.0'
    });
  }
}
