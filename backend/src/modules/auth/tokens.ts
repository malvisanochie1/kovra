import { jwtVerify, SignJWT } from 'jose';

const ISSUER = 'kovra-api';
const TTL = '30d';

const keyFrom = (secret: string) => new TextEncoder().encode(secret);

export function signAccessToken(userId: string, secret: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(keyFrom(secret));
}

/** Returns the user id for a valid token, or `undefined` for anything else. */
export async function verifyAccessToken(token: string, secret: string): Promise<string | undefined> {
  try {
    const { payload } = await jwtVerify(token, keyFrom(secret), { issuer: ISSUER });
    return payload.sub;
  } catch {
    return undefined;
  }
}
