import '../src/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { BagTray } from '@/features/bag/BagTray';
import { DropToTrayProvider } from '@/features/bag/DropToTray';
import { useAppFonts } from '@/lib/fonts';
import { useCatalog } from '@/store/catalog';
import { useStoresHydrated } from '@/store/hydration';
import { colors } from '@/theme/colors';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 280, fade: true });

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const hydrated = useStoresHydrated();
  const ready = fontsReady && hydrated;

  useEffect(() => {
    void useCatalog.getState().refresh();
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <StatusBar style="light" />
      <DropToTrayProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            contentStyle: { backgroundColor: colors.ink },
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="intro" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="product/[id]" options={{ animation: 'fade' }} />
          <Stack.Screen name="bag" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="order/[id]" options={{ gestureEnabled: false }} />
        </Stack>
        <BagTray />
      </DropToTrayProvider>
    </View>
  );
}
