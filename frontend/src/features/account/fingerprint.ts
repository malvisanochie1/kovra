import { ApiError } from '@/lib/api';
import { clearBiometricKey, saveBiometricKey, unlockBiometricKey } from '@/lib/biometrics';
import { auth, type Session } from '@/services/auth';
import { useSession } from '@/store/session';

const matches = (identifier: string, link: { username: string; email: string }) => {
  const value = identifier.trim().toLowerCase();
  return value === link.username || value === link.email;
};

/**
 * Turns on, or re-links, fingerprint sign-in for the signed-in account. The password
 * is checked first; the system fingerprint prompt then guards the new key.
 */
export async function linkFingerprint(session: Session, password: string): Promise<void> {
  const secret = await auth.enableBiometric(session, password);
  try {
    await saveBiometricKey({ username: session.user.username, email: session.user.email, secret });
  } catch {
    // The scan was cancelled, so the secret never reached the device: revoke it.
    await auth.disableBiometric(session, password).catch(() => undefined);
    throw new ApiError(0, 'cancelled', 'Fingerprint wasn’t confirmed. Nothing was changed.');
  }
  useSession.getState().setFingerprint({ username: session.user.username, email: session.user.email });
}

/** Turns fingerprint sign-in off for this phone. Requires the account password. */
export async function unlinkFingerprint(session: Session, password: string): Promise<void> {
  await auth.disableBiometric(session, password);
  await clearBiometricKey();
  useSession.getState().setFingerprint(null);
}

/**
 * Signs in with a fingerprint. The username or email must match the account the
 * fingerprint was linked to; otherwise the sensor is never even asked.
 */
export async function signInWithFingerprint(identifier: string): Promise<Session> {
  const link = useSession.getState().fingerprint;
  if (!link || !matches(identifier, link)) {
    throw new ApiError(401, 'unauthorized', 'Fingerprint sign-in isn’t set up for this account on this phone');
  }

  const key = await unlockBiometricKey();
  if (!key) {
    // Either the scan was cancelled, or the phone's fingerprints changed and the key was wiped.
    throw new ApiError(
      401,
      'unauthorized',
      'Fingerprint not confirmed. If fingerprints on this phone changed, sign in with your password and set it up again.',
    );
  }
  if (!matches(identifier, key)) throw new ApiError(401, 'unauthorized', 'Fingerprint sign-in isn’t set up for this account on this phone');

  try {
    return await auth.biometricLogin(identifier, key.secret);
  } catch (error) {
    // The account no longer recognises this phone's key (turned off elsewhere): forget it.
    if (error instanceof ApiError && error.status === 401) {
      await clearBiometricKey();
      useSession.getState().setFingerprint(null);
    }
    throw error;
  }
}
