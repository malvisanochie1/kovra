import * as SplashScreen from 'expo-splash-screen';

let revealed = false;

/**
 * Hides the native splash screen. Entry screens call this once they have laid
 * out, so the splash hands over directly to a drawn screen with no blank frame
 * in between. Safe to call any number of times.
 */
export function revealApp(): void {
  if (revealed) return;
  revealed = true;
  void SplashScreen.hideAsync();
}
