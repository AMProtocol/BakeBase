import { Request, Response } from 'express';
import { z } from 'zod';
import { panScaleFactor } from '../data/recipe-templates';
import { FormulationService } from '../services/formulation.service';
import { ApiResponse, Meta } from '../types';

const buildQuerySchema = z.object({
  pan_diameter_in: z.coerce.number().positive(),
  reference_diameter_in: z.coerce.number().positive().optional(),
  analyze: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => v === 'true' || v === '1')
});

const scaleQuerySchema = z.object({
  from_diameter_in: z.coerce.number().positive(),
  to_diameter_in: z.coerce.number().positive()
});

export class FormulationController {
  static list(_req: Request, res: Response): void {
    const meta: Meta = {
      endpoint_description:
        'Reference baking formulations with pan scaling. Use GET /formulations/:id?pan_diameter_in=12 to obtain gram weights and ingredient IDs.',
      field_glossary: {
        scaling_formula: 'Area ratio (D/d)² for constant fill height in round pans'
      }
    };

    res.json({
      success: true,
      data: FormulationService.listTemplateSummaries(),
      meta
    });
  }

  static panScale(req: Request, res: Response): void {
    const parsed = scaleQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.message,
        meta: { endpoint_description: 'Pan area scale factor', field_glossary: {} }
      });
      return;
    }

    const { from_diameter_in, to_diameter_in } = parsed.data;
    const factor = panScaleFactor(from_diameter_in, to_diameter_in);

    res.json({
      success: true,
      data: {
        from_diameter_in,
        to_diameter_in,
        scale_factor: Math.round(factor * 10000) / 10000,
        formula: 'scale_factor = (to_diameter_in / from_diameter_in)²',
        note: 'Multiply all ingredient masses by scale_factor when moving between round pans of the same batter height.'
      },
      meta: {
        endpoint_description: 'Deterministic pan scaling for round pans (same height).',
        field_glossary: {}
      }
    });
  }

  static async build(req: Request, res: Response): Promise<void> {
    try {
      const parsed = buildQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.message,
          meta: { endpoint_description: 'Build scaled formulation', field_glossary: {} }
        });
        return;
      }

      const { pan_diameter_in, reference_diameter_in, analyze } = parsed.data;
      const templateId = req.params.id;

      let built;
      try {
        built = await FormulationService.build(templateId, pan_diameter_in, reference_diameter_in);
      } catch (e) {
        res.status(404).json({
          success: false,
          error: e instanceof Error ? e.message : 'Not found',
          meta: { endpoint_description: 'Build scaled formulation', field_glossary: {} }
        });
        return;
      }

      if (built.missing_ingredients.length > 0) {
        res.status(503).json({
          success: false,
          error: `Catalog missing ingredients: ${built.missing_ingredients.join(', ')}`,
          data: built,
          meta: {
            endpoint_description: 'Partial formulation — re-seed or deploy latest catalog',
            field_glossary: {}
          }
        });
        return;
      }

      const analyses = analyze ? await FormulationService.analyzeBuilt(built, 'all') : undefined;

      const response: ApiResponse<typeof built & { chemistry?: typeof analyses }> = {
        success: true,
        data: analyses ? { ...built, chemistry: analyses } : built,
        meta: {
          endpoint_description:
            'Scaled formulation with BakeBase ingredient IDs. Optional analyze=true runs /combine on filling, crust, and full batch.',
          field_glossary: {
            quantity_g: 'Grams for target pan diameter',
            ingredient_id: 'Use in POST /ingredients/combine',
            baking: 'Oven procedure for this template (not inferred from combine)'
          }
        }
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        meta: { endpoint_description: 'Error', field_glossary: {} }
      });
    }
  }
}
