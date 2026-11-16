import { useEffect, useState } from 'react';
import { getBiometricSupport, type BiometricSupport } from '@/lib/biometrics';

/** Whether this device can use fingerprint sign-in. `null` while checking. */
export function useBiometricSupport(): BiometricSupport | null {
  const [support, setSupport] = useState<BiometricSupport | null>(null);

  useEffect(() => {
    let alive = true;
    void getBiometricSupport().then((result) => alive && setSupport(result));
    return () => {
      alive = false;
    };
  }, []);

  return support;
}
