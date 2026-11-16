import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createDb } from './db/client.js';
import { seedCatalog } from './db/seed.js';
import { createLogger } from './lib/logger.js';

const env = loadEnv();
const logger = createLogger(env);
const { db, close } = createDb(env.DATABASE_PATH);

const seeded = seedCatalog(db);
if (seeded) logger.info({ products: seeded }, 'Seeded catalogue');

const server = createApp({ db, env, logger }).listen(env.PORT, () => {
  logger.info(`Kovra API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => {
    close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
