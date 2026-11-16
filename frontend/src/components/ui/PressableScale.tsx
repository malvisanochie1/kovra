import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { spring } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'children'> {
  children?: ReactNode;
  className?: string;
  /** How far the element sinks while pressed. */
  pressedScale?: number;
}

/**
 * The tactile base for everything tappable: it sinks while held and springs back
 * slightly past its size on release, so a tap reads as "pressed, then pushed out".
 */
export function PressableScale({ children, pressedScale = 0.95, onPressIn, onPressOut, style, ...props }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...props}
      style={[animatedStyle, style as object]}
      onPressIn={(event) => {
        scale.set(withSpring(pressedScale, spring.soft));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, { ...spring.soft, velocity: 6 }));
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
