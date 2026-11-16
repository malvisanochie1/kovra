import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { gradients } from '@/theme/colors';
import { spring } from '@/theme/motion';

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill switcher with a gold thumb that glides between options. */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const segment = width / options.length;

  const thumb = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withSpring(index * segment, spring.calm) }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width - 8)}
      className="h-12 flex-row rounded-full border border-edge bg-ink-2 p-1"
    >
      {width > 0 && (
        <Animated.View style={[styles.thumb, thumb]}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill} />
        </Animated.View>
      )}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className="flex-1 items-center justify-center"
          >
            <Text className={`font-sora-semibold text-sm ${active ? 'text-ink' : 'text-mist'}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 999, overflow: 'hidden' },
  fill: { flex: 1 },
});
