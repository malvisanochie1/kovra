import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { withUniwind } from 'uniwind';
import { STAGGER_MS } from '@/theme/motion';

interface RevealProps {
  children: ReactNode;
  /** Position in a staggered group; each step adds a short delay. */
  index?: number;
  /** Extra delay in milliseconds. */
  delay?: number;
  /** Direction the content travels in from. */
  from?: 'below' | 'right';
  distance?: number;
  duration?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** The browser has no native animation module; it runs the same animation in JS. */
const nativeDriver = Platform.OS !== 'web';
const easing = Easing.bezier(0.22, 1, 0.36, 1);

/** React Native's Animated.View with Tailwind `className` support. */
const AnimatedView = withUniwind(Animated.View);

/**
 * Fades and glides content in when it mounts.
 *
 * Runs on React Native's native-driven Animated API, which Android applies
 * reliably to views anywhere on the page, including ones mounted off-screen. A
 * safety timer guarantees the content ends fully visible no matter what.
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  from = 'below',
  distance = 16,
  duration = 480,
  className = '',
  style,
}: RevealProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const total = delay + index * STAGGER_MS;
    const animation = Animated.timing(progress, { toValue: 1, duration, delay: total, easing, useNativeDriver: nativeDriver });
    animation.start();
    const fallback = setTimeout(() => progress.setValue(1), total + duration + 400);
    return () => {
      animation.stop();
      clearTimeout(fallback);
    };
  }, [delay, duration, index, progress]);

  const offset = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });

  return (
    <AnimatedView
      className={className}
      style={[{ opacity: progress, transform: [from === 'right' ? { translateX: offset } : { translateY: offset }] }, style]}
    >
      {children}
    </AnimatedView>
  );
}
