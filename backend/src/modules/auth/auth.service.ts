import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { and, eq, or } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { biometricCredentials, users } from '../../db/schema.js';
import { conflict, notFound, unauthorized } from '../../lib/errors.js';

type UserRow = typeof users.$inferSelect;

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
}

export const toPublicUser = ({ id, name, username, email, phone }: UserRow): PublicUser => ({ id, name, username, email, phone });

const BCRYPT_ROUNDS = 12;

/** Compared against when an account doesn't exist, so timing doesn't reveal which accounts do. */
const TIMING_GUARD_HASH = bcrypt.hashSync('kovra-timing-guard', BCRYPT_ROUNDS);

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

const sameHash = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Finds an account by username or email, both matched case-insensitively. */
function findByIdentifier(db: Db, identifier: string): UserRow | undefined {
  const value = identifier.trim().toLowerCase();
  return db
    .select()
    .from(users)
    .where(or(eq(users.username, value), eq(users.email, value)))
    .get();
}

export async function registerUser(
  db: Db,
  input: { name: string; username: string; email: string; phone: string; password: string },
): Promise<UserRow> {
  const username = input.username.toLowerCase();
  const email = input.email.toLowerCase();
  const taken = db
    .select({ username: users.username, email: users.email })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .get();
  if (taken) throw conflict(taken.username === username ? 'That username is taken' : 'An account with this email already exists');

  const now = new Date().toISOString();
  return db
    .insert(users)
    .values({
      id: randomUUID(),
      name: input.name,
      username,
      email,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export async function authenticate(db: Db, identifier: string, password: string): Promise<UserRow> {
  const user = findByIdentifier(db, identifier);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? TIMING_GUARD_HASH);
  if (!user || !valid) throw unauthorized('Username, email or password is incorrect');
  return user;
}

export function getUser(db: Db, id: string): UserRow {
  const user = db.select().from(users).where(eq(users.id, id)).get();
  if (!user) throw notFound('User');
  return user;
}

/** Confirms the signed-in user's password before any change to fingerprint sign-in. */
async function confirmPassword(db: Db, userId: string, password: string): Promise<UserRow> {
  const user = getUser(db, userId);
  if (!(await bcrypt.compare(password, user.passwordHash))) throw unauthorized('Password is incorrect');
  return user;
}

/**
 * Turns on (or re-links) fingerprint sign-in for one device. Returns a fresh secret
 * that the device must store behind its biometric lock; any previous secret for
 * this device stops working immediately.
 */
export async function enableBiometric(db: Db, userId: string, deviceId: string, password: string): Promise<string> {
  await confirmPassword(db, userId, password);
  const secret = randomBytes(32).toString('base64url');
  const now = new Date().toISOString();

  db.insert(biometricCredentials)
    .values({ id: randomUUID(), userId, deviceId, secretHash: sha256(secret), createdAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [biometricCredentials.userId, biometricCredentials.deviceId],
      set: { secretHash: sha256(secret), updatedAt: now },
    })
    .run();
  return secret;
}

export async function disableBiometric(db: Db, userId: string, deviceId: string, password: string): Promise<void> {
  await confirmPassword(db, userId, password);
  db.delete(biometricCredentials)
    .where(and(eq(biometricCredentials.userId, userId), eq(biometricCredentials.deviceId, deviceId)))
    .run();
}

/**
 * Fingerprint sign-in. The identifier must belong to the account the device's
 * secret was issued to, so a fingerprint alone, or with someone else's username,
 * is never enough.
 */
export function biometricSignIn(db: Db, identifier: string, deviceId: string, secret: string): UserRow {
  const failure = unauthorized('Fingerprint sign-in isn’t set up for this account on this phone');
  const user = findByIdentifier(db, identifier);
  if (!user) throw failure;

  const credential = db
    .select()
    .from(biometricCredentials)
    .where(and(eq(biometricCredentials.userId, user.id), eq(biometricCredentials.deviceId, deviceId)))
    .get();
  if (!credential || !sameHash(credential.secretHash, sha256(secret))) throw failure;
  return user;
}
