import { Router, Request, Response } from 'express';
import { containers } from '../services/cosmos';

export const conditionsRouter = Router();

// GET /api/conditions — list all health conditions (public)
conditionsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { resources } = await containers.conditions.items
      .query('SELECT * FROM c ORDER BY c.name ASC')
      .fetchAll();
    res.json({ conditions: resources });
  } catch (err: any) {
    console.error('GET /conditions error:', err.message);
    res.status(500).json({ error: 'Gesundheitsthemen konnten nicht geladen werden' });
  }
});

// GET /api/conditions/:id — get single condition with matching recipes (public)
conditionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resources } = await containers.conditions.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    if (!resources.length) {
      return res.status(404).json({ error: 'Gesundheitsthema nicht gefunden' });
    }

    const condition = resources[0];

    // Find matching recipes by health tags
    const tags = condition.tags || [];
    let recipes: any[] = [];
    if (tags.length > 0) {
      // Build a query that matches any of the condition's tags
      const tagConditions = tags.map((_: string, i: number) => `ARRAY_CONTAINS(c.healthTags, @tag${i})`).join(' OR ');
      const tagParams = tags.map((t: string, i: number) => ({ name: `@tag${i}`, value: t }));
      const { resources: matchingRecipes } = await containers.recipes.items
        .query({
          query: `SELECT * FROM c WHERE (NOT IS_DEFINED(c.deleted) OR c.deleted = false) AND (${tagConditions})`,
          parameters: tagParams,
        })
        .fetchAll();
      recipes = matchingRecipes;
    }

    res.json({ condition, recipes });
  } catch (err: any) {
    console.error('GET /conditions/:id error:', err.message);
    res.status(500).json({ error: 'Gesundheitsthema konnte nicht geladen werden' });
  }
});
