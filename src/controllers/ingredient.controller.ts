import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ChemistryService } from '../services/chemistry.service';
import { ApiResponse, IngredientInput, Meta } from '../types';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const combineSchema = z.object({
  ingredients: z.array(
    z.object({
      ingredient_id: z.string(),
      quantity_g: z.number().positive()
    })
  ).min(1)
});

export class IngredientController {
  /**
   * GET /ingredients
   * List all ingredients with optional filtering
   */
  static async getAll(req: Request, res: Response) {
    try {
      const { category, function: funcFilter } = req.query;

      const where: any = {};
      if (category) where.category = category;
      if (funcFilter) {
        where.primary_function = {
          contains: funcFilter as string,
          mode: 'insensitive'
        };
      }

      const ingredients = await prisma.ingredient.findMany({ where });

      const meta: Meta = {
        endpoint_description: 'Returns a list of all baking ingredients with optional filtering by category or function',
        field_glossary: {
          id: 'Unique identifier for the ingredient',
          name: 'Common name of the ingredient',
          category: 'Classification (flour, egg, fat, sugar, leavener)',
          water_content_pct: 'Water content as percentage of total weight',
          protein_content_pct: 'Protein content as percentage of total weight',
          gluten_forming: 'Boolean indicating if ingredient can form gluten networks',
          leavening_type: 'Type of leavening: biological, chemical, mechanical, steam, or null',
          typical_hydration_ratio: 'How much liquid this ingredient absorbs relative to its weight',
          primary_function: 'Main role this ingredient plays in baking'
        }
      };

      const response: ApiResponse<typeof ingredients> = {
        success: true,
        data: ingredients,
        meta
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        meta: {
          endpoint_description: 'Error occurred',
          field_glossary: {}
        }
      });
    }
  }

  /**
   * GET /ingredients/:id
   * Get a single ingredient by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const ingredient = await prisma.ingredient.findUnique({
        where: { id }
      });

      if (!ingredient) {
        return res.status(404).json({
          success: false,
          error: 'Ingredient not found',
          meta: {
            endpoint_description: 'Retrieves a single ingredient by its ID',
            field_glossary: {}
          }
        });
      }

      const meta: Meta = {
        endpoint_description: 'Returns complete data for a single ingredient including interactions and substitutions',
        field_glossary: {
          interactions: 'Array of how this ingredient interacts with others chemically and physically',
          substitution_ratio: 'Array of alternative ingredients and conversion ratios',
          temperature_sensitivity: 'How this ingredient behaves at key temperature thresholds',
          source_notes: 'Scientific sources and references for this data',
          confidence_level: 'Data reliability: verified (peer-reviewed), community, or inferred'
        }
      };

      const response: ApiResponse<typeof ingredient> = {
        success: true,
        data: ingredient,
        meta
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        meta: {
          endpoint_description: 'Error occurred',
          field_glossary: {}
        }
      });
    }
  }

  /**
   * GET /ingredients/search?q=
   * Fuzzy search by name or function
   */
  static async search(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required',
          meta: {
            endpoint_description: 'Searches ingredients by name or function',
            field_glossary: {}
          }
        });
      }

      const ingredients = await prisma.ingredient.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { primary_function: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } }
          ]
        }
      });

      const meta: Meta = {
        endpoint_description: `Search results for "${q}"`,
        field_glossary: {
          name: 'Ingredient name',
          category: 'Classification',
          primary_function: 'Main role in baking',
          description: 'Detailed description'
        }
      };

      const response: ApiResponse<typeof ingredients> = {
        success: true,
        data: ingredients,
        meta
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        meta: {
          endpoint_description: 'Error occurred',
          field_glossary: {}
        }
      });
    }
  }

  /**
   * POST /ingredients/combine
   * Combine ingredients and analyze chemistry
   */
  static async combine(req: Request, res: Response) {
    try {
      // Validate input
      const validation = combineSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input: ' + validation.error.message,
          meta: {
            endpoint_description: 'Combines multiple ingredients and performs chemistry analysis',
            field_glossary: {}
          }
        });
      }

      const { ingredients } = validation.data;

      // Fetch all ingredients
      const ingredientIds = ingredients.map(i => i.ingredient_id);
      const fetchedIngredients = await prisma.ingredient.findMany({
        where: { id: { in: ingredientIds } }
      });

      // Check all ingredients exist
      if (fetchedIngredients.length !== ingredientIds.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more ingredient IDs not found',
          meta: {
            endpoint_description: 'Combines multiple ingredients and performs chemistry analysis',
            field_glossary: {}
          }
        });
      }

      // Perform chemistry analysis
      const analysis = ChemistryService.analyzeCombination(ingredients, fetchedIngredients);

      const meta: Meta = {
        endpoint_description: 'Chemistry analysis of combined ingredients with predicted baking outcome',
        field_glossary: {
          total_hydration_pct: 'Total water content as percentage of combined weight',
          hydration_ratio_pct: 'Ratio of liquid to flour weight (e.g., 70 means 70g water per 100g flour)',
          leavening_adequacy: 'Assessment of whether enough leavening is present for the mass',
          protein_interaction_summary: 'How proteins will behave and interact during baking',
          predicted_texture_profile: 'Expected mouthfeel and structure characteristics',
          ph_environment: 'Acid/base balance and its effects on the bake',
          prediction: 'Plain-language prediction of likely outcome for AI agent interpretation',
          warnings: 'Potential issues or imbalances detected'
        }
      };

      const response: ApiResponse<typeof analysis> = {
        success: true,
        data: analysis,
        meta
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        meta: {
          endpoint_description: 'Error occurred',
          field_glossary: {}
        }
      });
    }
  }
}
