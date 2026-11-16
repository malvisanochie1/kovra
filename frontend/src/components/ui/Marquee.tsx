import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface MarqueeProps {
  children: ReactNode;
  /** Pixels per second. */
  speed?: number;
}

/** Endless, slow horizontal scroll. Content is rendered twice so the loop is seamless. */
export function Marquee({ children, speed = 28 }: MarqueeProps) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!width) return;
    x.set(0);
    x.set(withRepeat(withTiming(-width, { duration: (width / speed) * 1000, easing: Easing.linear }), -1));
    return () => cancelAnimation(x);
  }, [speed, width, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View className="overflow-hidden" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={style} className="flex-row">
        <View className="flex-row" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {children}
        </View>
        <View className="flex-row">{children}</View>
      </Animated.View>
    </View>
  );
}
