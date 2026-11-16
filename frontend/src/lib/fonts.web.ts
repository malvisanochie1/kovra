import { useFonts } from 'expo-font';

/** The web build has no native embedding, so the same four weights load at runtime. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    'Sora-Regular': require('../../assets/fonts/Sora-Regular.ttf'),
    'Sora-Medium': require('../../assets/fonts/Sora-Medium.ttf'),
    'Sora-SemiBold': require('../../assets/fonts/Sora-SemiBold.ttf'),
    'Sora-Bold': require('../../assets/fonts/Sora-Bold.ttf'),
  });
  return loaded || Boolean(error);
}
