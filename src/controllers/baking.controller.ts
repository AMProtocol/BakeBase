import { Request, Response } from 'express';
import { z } from 'zod';
import { MixValidationService } from '../services/mix-validation.service';
import { Meta } from '../types';

const lineSchema = z.object({
  ingredient_name: z.string().min(1),
  quantity_g: z.number().positive()
});

const validateMixSchema = z.object({
  ingredients: z.array(lineSchema).min(1),
  intent: z.enum(['auto', 'bread', 'custard', 'cake', 'cookie']).optional(),
  source_label: z.string().optional(),
  source_url: z.string().url().optional()
});

const scaleQuerySchema = z.object({
  from_diameter_in: z.coerce.number().positive(),
  to_diameter_in: z.coerce.number().positive()
});

export class BakingController {
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
    const factor = (to_diameter_in / from_diameter_in) ** 2;

    res.json({
      success: true,
      data: {
        from_diameter_in,
        to_diameter_in,
        scale_factor: Math.round(factor * 10000) / 10000,
        formula: 'scale_factor = (to_diameter_in / from_diameter_in)²',
        note: 'Multiply ingredient masses when scaling round pans at constant height. Does not validate recipe quality.'
      },
      meta: {
        endpoint_description: 'Reference math only — not a recipe source.',
        field_glossary: {}
      }
    });
  }

  static async validateMix(req: Request, res: Response): Promise<void> {
    const parsed = validateMixSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.message,
        meta: { endpoint_description: 'Validate external recipe grams', field_glossary: {} }
      });
      return;
    }

    try {
      const result = await MixValidationService.validate(parsed.data);

      if (!result.success) {
        res.status(422).json({
          success: false,
          error: result.error,
          data: { unresolved: result.unresolved, partial_resolved: result.partial_resolved },
          meta: {
            endpoint_description: 'Could not map all ingredients to catalog',
            field_glossary: {}
          }
        });
        return;
      }

      const meta: Meta = {
        endpoint_description:
          'Safeguard for agents: validate a web or user-provided ingredient list (grams) against BakeBase catalog and baking ratios. Not a recipe library.',
        field_glossary: {
          bakers_hydration_pct: 'Water ingredient grams ÷ flour grams × 100',
          'validation.status': 'ok | warn | fail from ratio/chemistry checks',
          intent_used: 'bread/custard/etc. from request or inferred from mix'
        }
      };

      res.json({ success: true, data: result, meta });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        meta: { endpoint_description: 'Error', field_glossary: {} }
      });
    }
  }
}
