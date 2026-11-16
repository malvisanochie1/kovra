import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { spring } from '@/theme/motion';

function Segment({ state }: { state: 'done' | 'active' | 'todo' }) {
  const amount = useSharedValue(0);
  useEffect(() => {
    amount.set(withSpring(state === 'todo' ? 0 : state === 'active' ? 0.5 : 1, spring.calm));
  }, [state, amount]);
  const fill = useAnimatedStyle(() => ({ width: `${amount.value * 100}%` }));
  return (
    <View className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
      <Animated.View style={fill} className="h-full rounded-full bg-gold" />
    </View>
  );
}

/** Thin segmented progress: finished steps are full, the current one half-filled. */
export function StepProgress({ total, current }: { total: number; current: number }) {
  return (
    <View className="flex-row gap-1.5" accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: current + 1 }}>
      {Array.from({ length: total }, (_, i) => (
        <Segment key={i} state={i < current ? 'done' : i === current ? 'active' : 'todo'} />
      ))}
    </View>
  );
}
