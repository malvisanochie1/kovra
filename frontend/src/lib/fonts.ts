/**
 * On Android and iOS the Sora files are embedded at build time by the expo-font
 * config plugin, so there is nothing to load and the first frame is never delayed.
 */
export function useAppFonts(): boolean {
  return true;
}
