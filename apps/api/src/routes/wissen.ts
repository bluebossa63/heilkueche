import { Router, Request, Response } from 'express';
import { containers } from '../services/cosmos';

export const wissenRouter = Router();

// GET /api/wissen — list all articles (public)
wissenRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { resources } = await containers.wissen.items
      .query('SELECT * FROM c ORDER BY c.createdAt DESC')
      .fetchAll();
    res.json({ articles: resources });
  } catch (err: any) {
    console.error('GET /wissen error:', err.message);
    res.status(500).json({ error: 'Wissensartikel konnten nicht geladen werden' });
  }
});

// GET /api/wissen/:id — get single article (public)
wissenRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { resources } = await containers.wissen.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: req.params.id }],
      })
      .fetchAll();

    if (!resources.length) {
      return res.status(404).json({ error: 'Artikel nicht gefunden' });
    }

    res.json({ article: resources[0] });
  } catch (err: any) {
    console.error('GET /wissen/:id error:', err.message);
    res.status(500).json({ error: 'Artikel konnte nicht geladen werden' });
  }
});
