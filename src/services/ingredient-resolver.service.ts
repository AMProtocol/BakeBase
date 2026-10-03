import { PrismaClient, Ingredient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NamedQuantity {
  ingredient_name: string;
  quantity_g: number;
}

export interface ResolvedQuantity {
  ingredient_name: string;
  quantity_g: number;
  ingredient_id: string;
  matched_name: string;
  match: 'exact' | 'search';
}

export class IngredientResolverService {
  static async resolve(lines: NamedQuantity[]): Promise<{ resolved: ResolvedQuantity[]; unresolved: string[] }> {
    const resolved: ResolvedQuantity[] = [];
    const unresolved: string[] = [];

    for (const line of lines) {
      const exact = await prisma.ingredient.findFirst({
        where: { name: { equals: line.ingredient_name, mode: 'insensitive' } }
      });

      if (exact) {
        resolved.push({
          ingredient_name: line.ingredient_name,
          quantity_g: line.quantity_g,
          ingredient_id: exact.id,
          matched_name: exact.name,
          match: 'exact'
        });
        continue;
      }

      const hits = await prisma.ingredient.findMany({
        where: {
          OR: [
            { name: { contains: line.ingredient_name, mode: 'insensitive' } },
            { description: { contains: line.ingredient_name, mode: 'insensitive' } }
          ]
        },
        take: 5
      });

      const best =
        hits.find((h) => h.name.toLowerCase() === line.ingredient_name.toLowerCase()) ?? hits[0];

      if (!best) {
        unresolved.push(line.ingredient_name);
        continue;
      }

      resolved.push({
        ingredient_name: line.ingredient_name,
        quantity_g: line.quantity_g,
        ingredient_id: best.id,
        matched_name: best.name,
        match: 'search'
      });
    }

    return { resolved, unresolved };
  }

  static mergeByIngredientId(lines: ResolvedQuantity[]): ResolvedQuantity[] {
    const map = new Map<string, ResolvedQuantity>();
    for (const line of lines) {
      const prev = map.get(line.ingredient_id);
      if (prev) {
        prev.quantity_g += line.quantity_g;
      } else {
        map.set(line.ingredient_id, { ...line });
      }
    }
    return [...map.values()];
  }

  static async fetchByIds(ids: string[]): Promise<Ingredient[]> {
    return prisma.ingredient.findMany({ where: { id: { in: ids } } });
  }
}
