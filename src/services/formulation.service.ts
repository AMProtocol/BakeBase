import { PrismaClient } from '@prisma/client';
import {
  getRecipeTemplate,
  panScaleFactor,
  RECIPE_TEMPLATES,
  RecipeTemplate,
  RecipeTemplateLine
} from '../data/recipe-templates';
import { ChemistryService } from './chemistry.service';
import { CombinedAnalysis, IngredientInput } from '../types';

const prisma = new PrismaClient();

export interface ScaledLine {
  ingredient_name: string;
  ingredient_id: string;
  quantity_g: number;
  component: RecipeTemplateLine['component'];
  grams_at_reference: number;
}

export interface BuiltFormulation {
  template_id: string;
  template_name: string;
  reference_pan_diameter_in: number;
  target_pan_diameter_in: number;
  scale_factor: number;
  scaling_formula: string;
  lines: ScaledLine[];
  baking: RecipeTemplate['baking'];
  missing_ingredients: string[];
}

export class FormulationService {
  static listTemplateSummaries() {
    return RECIPE_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      reference_pan: t.reference_pan,
      component_counts: {
        filling: t.lines.filter((l) => l.component === 'filling').length,
        crust: t.lines.filter((l) => l.component === 'crust').length
      },
      scaling_formula: t.scaling_formula
    }));
  }

  static async build(
    templateId: string,
    targetDiameterIn: number,
    referenceOverrideIn?: number
  ): Promise<BuiltFormulation> {
    const template = getRecipeTemplate(templateId);
    if (!template) {
      throw new Error(`Unknown formulation: ${templateId}`);
    }

    const referenceIn = referenceOverrideIn ?? template.reference_pan.diameter_in;
    const scale = panScaleFactor(referenceIn, targetDiameterIn);

    const names = [...new Set(template.lines.map((l) => l.ingredient_name))];
    const rows = await prisma.ingredient.findMany({
      where: { name: { in: names } }
    });
    const byName = new Map(rows.map((r) => [r.name, r]));

    const missing: string[] = [];
    const lines: ScaledLine[] = [];

    for (const line of template.lines) {
      const ing = byName.get(line.ingredient_name);
      if (!ing) {
        missing.push(line.ingredient_name);
        continue;
      }
      const quantity_g = Math.round(line.grams_at_reference * scale * 10) / 10;
      lines.push({
        ingredient_name: line.ingredient_name,
        ingredient_id: ing.id,
        quantity_g,
        component: line.component,
        grams_at_reference: line.grams_at_reference
      });
    }

    return {
      template_id: template.id,
      template_name: template.name,
      reference_pan_diameter_in: referenceIn,
      target_pan_diameter_in: targetDiameterIn,
      scale_factor: Math.round(scale * 10000) / 10000,
      scaling_formula: template.scaling_formula,
      lines,
      baking: template.baking,
      missing_ingredients: missing
    };
  }

  static async analyzeBuilt(
    built: BuiltFormulation,
    component?: 'filling' | 'crust' | 'all'
  ): Promise<{ component: string; analysis: CombinedAnalysis }[]> {
    const groups: Array<{ label: string; filter: (l: ScaledLine) => boolean }> = [];

    if (!component || component === 'all') {
      groups.push({ label: 'all', filter: () => true });
      groups.push({ label: 'filling', filter: (l) => l.component === 'filling' });
      groups.push({ label: 'crust', filter: (l) => l.component === 'crust' });
    } else {
      groups.push({ label: component, filter: (l) => l.component === component });
    }

    const results: { component: string; analysis: CombinedAnalysis }[] = [];

    for (const group of groups) {
      const subset = built.lines.filter(group.filter);
      if (subset.length === 0) continue;

      const inputs: IngredientInput[] = subset.map((l) => ({
        ingredient_id: l.ingredient_id,
        quantity_g: l.quantity_g
      }));

      const ids = inputs.map((i) => i.ingredient_id);
      const ingredients = await prisma.ingredient.findMany({ where: { id: { in: ids } } });
      results.push({
        component: group.label,
        analysis: ChemistryService.analyzeCombination(inputs, ingredients)
      });
    }

    return results;
  }
}
