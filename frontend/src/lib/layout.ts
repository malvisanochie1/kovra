import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Width at which navigation moves from the floating bottom bar to a side rail. */
export const RAIL_BREAKPOINT = 900;
export const RAIL_WIDTH = 96;
export const DOCK_HEIGHT = 72;
/** Height of the Bag Tray that rests above the dock. */
export const TRAY_HEIGHT = 56;
export const CONTENT_MAX_WIDTH = 1240;

export interface Layout {
  width: number;
  height: number;
  /** Side rail instead of the bottom tab bar. */
  rail: boolean;
  isTablet: boolean;
  gutter: number;
  /** Width available to page content after navigation chrome and gutters. */
  contentWidth: number;
  columns: number;
  /** Space a dock screen leaves at the bottom so content clears the dock and the tray. */
  bottomInset: number;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rail = width >= RAIL_BREAKPOINT;
  const isTablet = width >= 768; // Tailwind `md`, so JS and class-based layouts agree
  const gutter = isTablet ? 32 : 20;
  const available = Math.min(width - (rail ? RAIL_WIDTH : 0), CONTENT_MAX_WIDTH);
  const contentWidth = available - gutter * 2;
  const columns = contentWidth < 560 ? 2 : contentWidth < 820 ? 3 : contentWidth < 1080 ? 4 : 5;
  const bottomInset = rail ? TRAY_HEIGHT + 64 : DOCK_HEIGHT + TRAY_HEIGHT + Math.max(insets.bottom, 12) + 40;

  return { width, height, rail, isTablet, gutter, contentWidth, columns, bottomInset };
}

/** Width of one cell in a grid with `columns` columns and `gap` spacing. */
export const cellWidth = (contentWidth: number, columns: number, gap: number) => Math.floor((contentWidth - gap * (columns - 1)) / columns);
