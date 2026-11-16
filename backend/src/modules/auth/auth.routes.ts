import { Router } from 'express';
import { z } from 'zod';
import type { AppContext } from '../../context.js';
import { parse } from '../../lib/validation.js';
import { requireUser } from '../../middleware/auth.js';
import { phoneSchema } from '../shared-schemas.js';
import { authenticate, biometricSignIn, disableBiometric, enableBiometric, getUser, registerUser, toPublicUser } from './auth.service.js';
import { signAccessToken } from './tokens.js';

const password = z.string().min(8, 'Use at least 8 characters').max(72);
const identifier = z.string().trim().min(3, 'Enter your username or email').max(120);
const deviceId = z.string().min(16).max(80);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_.]{3,24}$/, 'Use 3–24 letters, numbers, dots or underscores'),
  email: z.email().max(120),
  phone: phoneSchema,
  password,
});

const loginSchema = z.object({ identifier, password: z.string().min(1) });
const biometricChangeSchema = z.object({ deviceId, password: z.string().min(1) });
const biometricLoginSchema = z.object({ identifier, deviceId, secret: z.string().min(32).max(64) });

export function authRouter({ db, env }: AppContext): Router {
  const router = Router();
  const session = async (user: Parameters<typeof toPublicUser>[0]) => ({
    token: await signAccessToken(user.id, env.JWT_SECRET),
    user: toPublicUser(user),
  });

  router.post('/register', async (req, res) => {
    const user = await registerUser(db, parse(registerSchema, req.body));
    res.status(201).json({ data: await session(user) });
  });

  router.post('/login', async (req, res) => {
    const input = parse(loginSchema, req.body);
    res.json({ data: await session(await authenticate(db, input.identifier, input.password)) });
  });

  router.get('/me', requireUser, (_req, res) => {
    res.json({ data: toPublicUser(getUser(db, res.locals.userId!)) });
  });

  /** Turns on, or re-links, fingerprint sign-in for this device. Requires the password. */
  router.post('/biometric', requireUser, async (req, res) => {
    const input = parse(biometricChangeSchema, req.body);
    const secret = await enableBiometric(db, res.locals.userId!, input.deviceId, input.password);
    res.status(201).json({ data: { secret } });
  });

  /** Turns off fingerprint sign-in for this device. Requires the password. */
  router.post('/biometric/disable', requireUser, async (req, res) => {
    const input = parse(biometricChangeSchema, req.body);
    await disableBiometric(db, res.locals.userId!, input.deviceId, input.password);
    res.status(204).end();
  });

  router.post('/biometric/login', async (req, res) => {
    const input = parse(biometricLoginSchema, req.body);
    res.json({ data: await session(biometricSignIn(db, input.identifier, input.deviceId, input.secret)) });
  });

  return router;
}
