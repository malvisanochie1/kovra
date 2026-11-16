import type { BiometricKey, BiometricSupport } from './biometrics';

/** Browsers can't reach the phone's fingerprint sensor, so fingerprint sign-in is app-only. */

export type { BiometricKey, BiometricSupport };

export const getBiometricSupport = async (): Promise<BiometricSupport> => ({
  available: false,
  reason: 'Fingerprint sign-in is available in the Android and iOS app.',
});

export const getDeviceId = async (): Promise<string> => 'web';
export const saveBiometricKey = async (_key: BiometricKey): Promise<void> => undefined;
export const unlockBiometricKey = async (): Promise<BiometricKey | null> => null;
export const clearBiometricKey = async (): Promise<void> => undefined;
export const newSecret = (): string => crypto.randomUUID();
