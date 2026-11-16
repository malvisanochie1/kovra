import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollContext } from '@/components/motion/ScrollReveal';
import { useLayout } from '@/lib/layout';
import { revealApp } from '@/lib/splash';

interface ScrollShellProps {
  /** Shown in the compact bar that fades in once the page is scrolled. */
  title: string;
  /** Optional large page title that recedes into the compact bar as the page scrolls. */
  heading?: { title: string; subtitle?: string };
  right?: ReactNode;
  children: ReactNode;
}

/**
 * Page frame for the dock sections: safe-area aware, padded to clear the dock and
 * tray, and scroll-aware. It shares the scroll position with ScrollReveal sections
 * and shrinks the large title into a compact bar, all on the UI thread.
 */
export function ScrollShell({ title, heading, right, children }: ScrollShellProps) {
  const insets = useSafeAreaInsets();
  const { bottomInset } = useLayout();
  const scrollY = useSharedValue(0);
  const barShown = useSharedValue(false);
  // The bar only takes touches once visible, so it never blocks the content beneath it.
  const [barActive, setBarActive] = useState(false);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
    const shown = event.contentOffset.y > 80;
    if (shown !== barShown.get()) {
      barShown.set(shown);
      runOnJS(setBarActive)(shown);
    }
  });

  const bar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [50, 110], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(scrollY.get(), [50, 110], [-8, 0], 'clamp') }],
  }));

  const headingStyle = useAnimatedStyle(() => {
    const y = scrollY.get();
    return {
      opacity: interpolate(y, [0, 90], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(y, [-120, 0, 120], [-40, 0, 50], 'clamp') },
        { scale: interpolate(y, [-120, 0, 120], [1.04, 1, 0.97], 'clamp') },
      ],
    };
  });

  return (
    <ScrollContext.Provider value={scrollY}>
      <View className="flex-1 bg-ink" onLayout={revealApp}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: bottomInset }}
        >
          {heading && (
            <Animated.View style={headingStyle} className="mb-6 w-full max-w-[1240px] gap-1 self-center px-5 md:px-8">
              <Text className="font-sora-bold text-[30px] leading-9 text-snow" accessibilityRole="header">
                {heading.title}
              </Text>
              {heading.subtitle && <Text className="font-sora text-sm text-mist">{heading.subtitle}</Text>}
            </Animated.View>
          )}
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
    </ScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
});
