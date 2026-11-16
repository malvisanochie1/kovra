import { create } from 'zustand';

/**
 * Where the Bag Tray docks.
 * - `hidden`: not shown (checkout, the bag itself, account flows…)
 * - `dock`:   resting on the navigation dock
 * - `screen`: above the purchase bar on product pages
 */
export type TrayPlacement = 'hidden' | 'dock' | 'screen';

interface TrayState {
  placement: TrayPlacement;
  /** Screen that currently controls the tray, so a screen losing focus can't hide it for the next. */
  owner: string | null;
  /** Products currently flying towards the tray. Keeps it visible even when the bag is empty. */
  inFlight: number;
  /** Increments whenever a product lands, so the tray can play its catch animation. */
  landings: number;
  claim: (owner: string, placement: TrayPlacement) => void;
  release: (owner: string) => void;
  beginFlight: () => void;
  land: () => void;
}

export const useTray = create<TrayState>()((set) => ({
  placement: 'hidden',
  owner: null,
  inFlight: 0,
  landings: 0,
  claim: (owner, placement) => set({ owner, placement }),
  release: (owner) => set((s) => (s.owner === owner ? { owner: null, placement: 'hidden' } : s)),
  beginFlight: () => set((s) => ({ inFlight: s.inFlight + 1 })),
  land: () => set((s) => ({ inFlight: Math.max(0, s.inFlight - 1), landings: s.landings + 1 })),
}));
