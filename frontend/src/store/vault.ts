import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

interface VaultState {
  ids: string[];
  /** Returns `true` when the product is now in the vault. */
  toggle: (id: string) => boolean;
}

/** Products the customer has locked away to come back to. */
export const useVault = create<VaultState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const kept = get().ids.includes(id);
        set({ ids: kept ? get().ids.filter((x) => x !== id) : [id, ...get().ids] });
        return !kept;
      },
    }),
    { name: 'kovra.vault', storage: persistStorage, version: 1 },
  ),
);

export const useInVault = (id: string) => useVault((s) => s.ids.includes(id));
