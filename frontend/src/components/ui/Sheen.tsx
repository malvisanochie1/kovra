import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ease } from '@/theme/motion';

interface SheenProps {
  /** Pause between sweeps, in milliseconds. */
  interval?: number;
  intensity?: number;
}

/** A soft band of light that glides across its parent every few seconds. */
export function Sheen({ interval = 3200, intensity = 0.35 }: SheenProps) {
  const progress = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withRepeat(withSequence(withDelay(interval, withTiming(1, { duration: 1100, easing: ease })), withTiming(0, { duration: 0 })), -1),
    );
    return () => cancelAnimation(progress);
  }, [interval, progress]);

  const style = useAnimatedStyle(() => ({
    width: width.value * 0.45,
    transform: [{ translateX: -width.value * 0.6 + progress.value * width.value * 2.1 }, { skewX: '-20deg' }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip]}
      onLayout={(event) => {
        width.set(event.nativeEvent.layout.width);
      }}
    >
      <Animated.View style={[styles.band, style]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', `rgba(255,255,255,${intensity})`, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  band: { position: 'absolute', top: 0, bottom: 0 },
});
