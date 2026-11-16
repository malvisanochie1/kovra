import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { ease, STAGGER_MS } from '@/theme/motion';

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

/**
 * Fades and glides content in when it mounts.
 *
 * Built on plain animated styles rather than Reanimated layout animations: those
 * can leave content invisible on some Android devices until something re-renders,
 * whereas this always ends fully visible.
 */
export function Reveal({ children, index = 0, delay = 0, from = 'below', distance = 18, duration = 520, className, style }: RevealProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withDelay(delay + index * STAGGER_MS, withTiming(1, { duration, easing: ease })));
  }, [delay, duration, index, progress]);

  const animated = useAnimatedStyle(() => {
    const p = progress.get();
    const offset = (1 - p) * distance;
    return {
      opacity: p,
      transform: from === 'right' ? [{ translateX: offset }] : [{ translateY: offset }, { scale: 0.985 + p * 0.015 }],
    };
  });

  return (
    <Animated.View style={[animated, style]} className={className}>
      {children}
    </Animated.View>
  );
}
