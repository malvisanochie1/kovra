import { categories, type Product } from '@kovra/shared';
import { and, asc, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import type { AppContext } from '../../context.js';
import { products } from '../../db/schema.js';
import { notFound } from '../../lib/errors.js';
import { parse } from '../../lib/validation.js';

const listQuery = z.object({
  category: z.enum(['phones', 'audio', 'wearables', 'power', 'accessories']).optional(),
  platform: z.enum(['ios', 'android']).optional(),
  condition: z.enum(['new', 'uk-used', 'pre-owned']).optional(),
  featured: z.stringbool().optional(),
  q: z.string().trim().max(60).optional(),
});

type ProductRow = typeof products.$inferSelect;

/** Strips persistence-only columns and nulls so the wire format matches the shared `Product` type. */
export const toProduct = ({ createdAt: _c, updatedAt: _u, ...row }: ProductRow): Product =>
  Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)) as unknown as Product;

export function catalogRouter({ db }: AppContext): Router {
  const router = Router();

  router.get('/categories', (_req, res) => {
    res.json({ data: categories });
  });

  router.get('/products', (req, res) => {
    const query = parse(listQuery, req.query);
    const filters: SQL[] = [];
    if (query.category) filters.push(eq(products.category, query.category));
    if (query.platform) filters.push(eq(products.platform, query.platform));
    if (query.condition) filters.push(eq(products.condition, query.condition));
    if (query.featured !== undefined) filters.push(eq(products.featured, query.featured));
    if (query.q) {
      const term = `%${query.q}%`;
      filters.push(or(like(products.name, term), like(products.brand, term))!);
    }

    const rows = db
      .select()
      .from(products)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(products.featured), asc(products.category), desc(products.price))
      .all();

    res.json({ data: rows.map(toProduct) });
  });

  router.get('/products/:id', (req, res) => {
    const row = db.select().from(products).where(eq(products.id, req.params.id)).get();
    if (!row) throw notFound('Product');
    res.json({ data: toProduct(row) });
  });

  return router;
}
