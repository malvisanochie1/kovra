import { products as catalog } from '@kovra/shared';
import { count } from 'drizzle-orm';
import type { Db } from './client.js';
import { products } from './schema.js';

/** Loads the shared catalogue into an empty database. Safe to call on every boot. */
export function seedCatalog(db: Db): number {
  const existing = db.select({ total: count() }).from(products).get()?.total ?? 0;
  if (existing > 0) return 0;

  const now = new Date().toISOString();
  db.insert(products)
    .values(catalog.map((product) => ({ featured: false, ...product, createdAt: now, updatedAt: now })))
    .run();
  return catalog.length;
}
