import type { Env } from './config/env.js';
import type { Db } from './db/client.js';
import type { Logger } from './lib/logger.js';

/** Dependencies handed to every module. Keeping them explicit makes the API trivial to test. */
export interface AppContext {
  db: Db;
  env: Env;
  logger: Logger;
}
