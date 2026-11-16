import { pino, type Logger } from 'pino';
import type { Env } from '../config/env.js';

export function createLogger(env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>): Logger {
  return pino({
    level: env.LOG_LEVEL,
    redact: ['req.headers.authorization', '*.password', '*.passwordHash'],
    ...(env.NODE_ENV === 'development' && { transport: { target: 'pino-pretty', options: { colorize: true } } }),
  });
}

export type { Logger };
