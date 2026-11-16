import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/lib/layout';

interface ScrollShellProps {
  /** Shown in the compact bar that fades in once the page is scrolled. */
  title: string;
  right?: ReactNode;
  children: ReactNode;
}

/**
 * Page frame for the dock sections: safe-area aware, padded to clear the dock
 * and tray, with a compact title bar that materialises as the page scrolls.
 */
export function ScrollShell({ title, right, children }: ScrollShellProps) {
  const insets = useSafeAreaInsets();
  const { bottomInset } = useLayout();
  const scrollY = useSharedValue(0);
  const barShown = useSharedValue(false);
  // The bar only takes touches once visible, so it never blocks the content beneath it.
  const [barActive, setBarActive] = useState(false);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
    const shown = event.contentOffset.y > 80;
    if (shown !== barShown.value) {
      barShown.set(shown);
      runOnJS(setBarActive)(shown);
    }
  });

  const bar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 110], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(scrollY.value, [40, 110], [-8, 0], 'clamp') }],
  }));

  return (
    <View className="flex-1 bg-ink">
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: bottomInset }}
      >
        {children}
      </Animated.ScrollView>
      <Animated.View
        pointerEvents={barActive ? 'box-none' : 'none'}
        style={[styles.bar, { paddingTop: insets.top + 6 }, bar]}
        className="border-b border-edge bg-ink/95"
      >
        <View className="w-full max-w-[1240px] flex-row items-center justify-between self-center px-5 pb-3 md:px-8">
          <Text className="font-sora-semibold text-base text-snow">{title}</Text>
          {right}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
});
