import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';

export type Db = BetterSQLite3Database<typeof schema>;

/** npm scripts run from the package root, where drizzle-kit writes migrations. */
const migrationsFolder = resolve(process.cwd(), 'drizzle');

/** Opens (or creates) the database, applies pending migrations and returns a typed client. */
export function createDb(path: string): { db: Db; close: () => void } {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });

  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });

  return { db, close: () => sqlite.close() };
}
