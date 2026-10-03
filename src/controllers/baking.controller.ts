import { Request, Response } from 'express';
import { z } from 'zod';
import { MixValidationService } from '../services/mix-validation.service';
import { UnitConversionService } from '../services/unit-conversion.service';
import { Meta } from '../types';

const lineSchema = z
  .object({
    ingredient_name: z.string().min(1),
    quantity_g: z.number().positive().optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).optional()
  })
  .refine((l) => (l.quantity_g !== undefined) !== (l.quantity !== undefined && l.unit !== undefined), {
    message: 'Provide quantity_g OR both quantity and unit per ingredient'
  });

const processSchema = z.object({
  yeast_type: z.enum(['instant', 'active_dry', 'fresh', 'unknown']).optional(),
  cold_retard_hours: z.number().nonnegative().optional(),
  room_temp_bulk_hours: z.number().nonnegative().optional(),
  style: z
    .enum([
      'lean_bread',
      'enriched_bread',
      'sourdough',
      'pizza',
      'baguette',
      'sandwich_loaf',
      'rolls',
      'quick_yeast',
      'muffin_quick_bread',
      'cake',
      'cookie',
      'pastry',
      'unknown'
    ])
    .optional(),
  target_dough_temp_c: z.number().min(10).max(40).optional(),
  ambient_temp_c: z.number().min(-5).max(45).optional(),
  preferment_bakers_pct: z.number().min(0).max(100).optional()
});

const validateMixSchema = z.object({
  ingredients: z.array(lineSchema).min(1),
  intent: z.enum(['auto', 'bread', 'custard', 'cake', 'cookie']).optional(),
  source_label: z.string().optional(),
  source_url: z.string().url().optional(),
  process: processSchema.optional()
});

const convertQuerySchema = z.object({
  ingredient_name: z.string().min(1),
  amount: z.coerce.number().positive(),
  unit: z.string().min(1)
});

const scaleQuerySchema = z.object({
  from_diameter_in: z.coerce.number().positive(),
  to_diameter_in: z.coerce.number().positive()
});

export class BakingController {
  static async convertUnits(req: Request, res: Response): Promise<void> {
    const parsed = convertQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.message,
        meta: { endpoint_description: 'Convert to grams using catalog density', field_glossary: {} }
      });
      return;
    }

    try {
      const data = await UnitConversionService.convertByIngredientName(
        parsed.data.ingredient_name,
        parsed.data.amount,
        parsed.data.unit
      );
      res.json({
        success: true,
        data: {
          ...data,
          disclaimer:
            'Volume-to-weight uses catalog density; cup measures vary by packing. Prefer grams from a scale when possible.'
        },
        meta: {
          endpoint_description: 'Reference conversion — not a recipe source.',
          field_glossary: {}
        }
      });
    } catch (e) {
      res.status(422).json({
        success: false,
        error: e instanceof Error ? e.message : 'Conversion failed',
        meta: { endpoint_description: 'Conversion failed', field_glossary: {} }
      });
    }
  }

  static listUnits(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        units: UnitConversionService.supportedUnits(),
        note: 'GET /baking/convert?ingredient_name=&amount=&unit='
      },
      meta: { endpoint_description: 'Supported unit strings for /baking/convert', field_glossary: {} }
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
          bakers_hydration_pct:
            'Free water ingredient ÷ total flour × 100 (includes starter water split)',
          bakers_hydration_total_liquid_pct:
            'Sum of catalog water from all ingredients ÷ total flour — use for brioche/enriched doughs',
          bakers_hydration_explicit_only_pct: 'Explicit water ÷ explicit flour only (ignores starter)',
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
