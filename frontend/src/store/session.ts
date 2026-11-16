import type { Customer } from '@kovra/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';
import type { Account, Session } from '@/services/auth';

/** Which account this phone's fingerprint key belongs to. Not a secret: the key itself lives in secure hardware. */
export interface FingerprintLink {
  username: string;
  email: string;
}

interface SessionState {
  onboarded: boolean;
  profile: Account | null;
  token: string | null;
  fingerprint: FingerprintLink | null;
  /** Details from the last checkout, used to prefill the next one for guests. */
  lastCustomer: Customer | null;
  completeOnboarding: () => void;
  signIn: (session: Session) => void;
  signOut: () => void;
  setFingerprint: (link: FingerprintLink | null) => void;
  rememberCustomer: (customer: Customer) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: null,
      token: null,
      fingerprint: null,
      lastCustomer: null,
      completeOnboarding: () => set({ onboarded: true }),
      signIn: ({ user, token }) => set({ profile: user, token }),
      // The fingerprint link survives sign-out: that is what makes fingerprint sign-in possible next time.
      signOut: () => set({ profile: null, token: null }),
      setFingerprint: (fingerprint) => set({ fingerprint }),
      rememberCustomer: (lastCustomer) => set({ lastCustomer }),
    }),
    { name: 'kovra.session', storage: persistStorage, version: 1 },
  ),
);
