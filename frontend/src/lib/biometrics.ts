import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/**
 * Fingerprint sign-in, device side.
 *
 * Phones never hand raw fingerprints to apps, so Kovra can't record its own. Instead,
 * when fingerprint sign-in is turned on, a secret issued for the account is written
 * to hardware-backed storage that only a successful fingerprint scan can unlock.
 * The key is also invalidated by the OS if a new fingerprint is ever added to the
 * phone, which turns fingerprint sign-in off until the owner re-links it with their
 * password.
 */

const KEY = 'kovra.biometric.key';
const DEVICE_KEY = 'kovra.device.id';

export interface BiometricKey {
  /** Username the key was issued for, lowercased. Sign-in requires the same identifier. */
  username: string;
  email: string;
  secret: string;
}

export interface BiometricSupport {
  available: boolean;
  /** Why it isn't available, for display. */
  reason?: string;
}

export async function getBiometricSupport(): Promise<BiometricSupport> {
  if (!(await LocalAuthentication.hasHardwareAsync())) return { available: false, reason: 'This phone has no fingerprint sensor.' };
  if (!(await LocalAuthentication.isEnrolledAsync())) {
    return { available: false, reason: 'Add a fingerprint in your phone’s settings first, then come back.' };
  }
  return { available: SecureStore.canUseBiometricAuthentication() };
}

/** Stable random ID for this installation, used to scope fingerprint keys to one device. */
export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_KEY, id);
  return id;
}

/** Stores the key behind the fingerprint lock. Shows the system fingerprint prompt. */
export async function saveBiometricKey(key: BiometricKey): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(key), {
    requireAuthentication: true,
    authenticationPrompt: 'Touch the sensor to link your fingerprint to Kovra',
  });
}

/**
 * Asks for a fingerprint and returns the stored key, or `null` when the scan is
 * cancelled or the key no longer exists (for example after a new fingerprint was
 * added to the phone).
 */
export async function unlockBiometricKey(): Promise<BiometricKey | null> {
  try {
    const value = await SecureStore.getItemAsync(KEY, {
      requireAuthentication: true,
      authenticationPrompt: 'Sign in to Kovra',
    });
    return value ? (JSON.parse(value) as BiometricKey) : null;
  } catch {
    return null;
  }
}

export async function clearBiometricKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY, { requireAuthentication: true }).catch(() => undefined);
}

/** A strong random secret for accounts that live on this device (offline mode). */
export function newSecret(): string {
  return Array.from(Crypto.getRandomBytes(32), (b) => b.toString(16).padStart(2, '0')).join('');
}
