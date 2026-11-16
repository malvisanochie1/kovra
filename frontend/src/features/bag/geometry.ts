import { DOCK_HEIGHT, TRAY_HEIGHT, type Layout } from '@/lib/layout';
import type { TrayPlacement } from '@/store/tray';

/** Height of the sticky purchase bar on product pages; the tray rests just above it. */
export const PURCHASE_BAR_HEIGHT = 92;

export interface TrayFrame {
  left: number;
  bottom: number;
  width: number;
}

/** Where the Bag Tray sits for a given placement, in window coordinates. */
export function trayFrame(layout: Layout, safeBottom: number, placement: TrayPlacement): TrayFrame {
  const base = Math.max(safeBottom, 12);

  // With the side rail there is no dock, so the tray sits bottom-right, clear of the content column.
  if (layout.rail) {
    const width = 340;
    const bottom = placement === 'screen' ? base + PURCHASE_BAR_HEIGHT + 12 : 28;
    return { width, bottom, left: layout.width - width - 32 };
  }

  const width = Math.min(380, layout.width - 48);
  const bottom = placement === 'screen' ? base + PURCHASE_BAR_HEIGHT + 12 : base + DOCK_HEIGHT + 12;
  return { width, bottom, left: (layout.width - width) / 2 };
}

/** The point products fly to: the tray's thumbnail well on its left. */
export function trayTarget(layout: Layout, safeBottom: number, placement: TrayPlacement) {
  const frame = trayFrame(layout, safeBottom, placement);
  return { x: frame.left + 28, y: layout.height - frame.bottom - TRAY_HEIGHT / 2 };
}
