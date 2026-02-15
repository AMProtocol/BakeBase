import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, CategorySummary, Meta } from '../types';

const prisma = new PrismaClient();

export class CategoryController {
  /**
   * GET /categories
   * List all categories with counts and examples
   */
  static async getAll(req: Request, res: Response) {
    try {
      // Get all ingredients grouped by category
      const ingredients = await prisma.ingredient.findMany({
        select: {
          category: true,
          name: true
        }
      });

      // Group by category
      const categoryMap = new Map<string, string[]>();
      ingredients.forEach(ing => {
        if (!categoryMap.has(ing.category)) {
          categoryMap.set(ing.category, []);
        }
        categoryMap.get(ing.category)!.push(ing.name);
      });

      // Create summary
      const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, names]) => ({
        category,
        count: names.length,
        examples: names.slice(0, 5) // First 5 examples
      }));

      const meta: Meta = {
        endpoint_description: 'Returns all ingredient categories with counts and examples',
        field_glossary: {
          category: 'Classification name (flour, egg, fat, sugar, leavener)',
          count: 'Number of ingredients in this category',
          examples: 'Sample ingredient names from this category'
        }
      };

      const response: ApiResponse<typeof categories> = {
        success: true,
        data: categories,
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
