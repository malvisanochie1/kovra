import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Env } from '../config/env.js';
import { forbidden, unauthorized } from '../lib/errors.js';
import { verifyAccessToken } from '../modules/auth/tokens.js';

declare global {
  namespace Express {
    interface Locals {
      userId?: string;
    }
  }
}

const bearer = (req: Request) => {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
};

/** Attaches `res.locals.userId` when a valid token is present. Never rejects. */
export const identify = (env: Env) => async (req: Request, res: Response, next: NextFunction) => {
  const token = bearer(req);
  if (token) res.locals.userId = await verifyAccessToken(token, env.JWT_SECRET);
  next();
};

export const requireUser = (_req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.userId) throw unauthorized();
  next();
};

export const requireAdmin = (env: Env) => (req: Request, _res: Response, next: NextFunction) => {
  const token = bearer(req);
  const expected = Buffer.from(env.ADMIN_TOKEN);
  const given = Buffer.from(token ?? '');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw forbidden();
  next();
};
