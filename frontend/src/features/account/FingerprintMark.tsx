import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { spring } from '@/theme/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Concentric ridges of a stylised fingerprint, drawn in a 64×64 box. */
const RIDGES = [
  'M20 46c-2.5-4-3.5-8.5-3.5-13.5C16.5 23 23.5 16 32 16s15.5 7 15.5 16.5c0 2 0 4-.5 6',
  'M25 50c-2.5-4.5-3.8-10-3.8-15.5 0-6.5 4.8-11.5 10.8-11.5s10.8 5 10.8 11.5c0 4.5-.5 8.5-1.8 12.5',
  'M31 53c-2.5-5-3.8-11-3.8-17 0-2.5 2-4.5 4.8-4.5s4.8 2 4.8 4.5c0 6-1 11.5-3.2 16.5',
  'M14 26c3.5-8 10.2-13 18-13 6.5 0 12.3 3.4 16 9',
  'M42 52c1.5-3.8 2.5-8.4 2.8-13',
];
const RIDGE_LENGTH = 70;

export type ScanState = 'idle' | 'scanning' | 'success' | 'error';

/**
 * Kovra's fingerprint emblem. Ridges trace themselves while waiting for the sensor,
 * fill gold on success and give a short shake on failure.
 */
export function FingerprintMark({ state, size = 120 }: { state: ScanState; size?: number }) {
  const draw = useSharedValue(0.35);
  const shake = useSharedValue(0);
  const glow = useSharedValue(0);
  const scan = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(draw);
    cancelAnimation(scan);
    if (state === 'scanning') {
      draw.set(
        withRepeat(
          withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }), withTiming(0.35, { duration: 700 })),
          -1,
        ),
      );
      scan.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true));
    } else {
      draw.set(withTiming(state === 'success' ? 1 : 0.35, { duration: 500 }));
      scan.set(withTiming(0, { duration: 200 }));
    }
    glow.set(withSpring(state === 'success' ? 1 : 0, spring.calm));
    if (state === 'error') {
      shake.set(withSequence(...[10, -8, 6, -4, 0].map((x) => withTiming(x, { duration: 60 }))));
    }
  }, [state, draw, scan, glow, shake]);

  const ridgeProps = useAnimatedProps(() => ({ strokeDashoffset: RIDGE_LENGTH * (1 - draw.value) }));
  const frame = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }, { scale: 1 + glow.value * 0.05 }] }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.15 + glow.value * 0.45 }));
  const line = useAnimatedStyle(() => ({
    opacity: state === 'scanning' ? 1 : 0,
    transform: [{ translateY: (scan.value - 0.5) * size * 0.7 }],
  }));

  const tint = state === 'error' ? colors.danger : colors.gold;

  return (
    <Animated.View style={[{ width: size, height: size }, frame]} className="items-center justify-center">
      <Animated.View style={[halo, { width: size, height: size, borderRadius: size * 0.3 }]} className="absolute bg-gold/30" />
      <View
        style={{ width: size, height: size, borderRadius: size * 0.3 }}
        className="items-center justify-center overflow-hidden border border-gold/40 bg-ink-3"
      >
        <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 64 64">
          {RIDGES.map((d) => (
            <Path key={`base-${d}`} d={d} stroke="rgba(255,255,255,0.08)" strokeWidth={2.6} strokeLinecap="round" fill="none" />
          ))}
          {RIDGES.map((d) => (
            <AnimatedPath
              key={d}
              d={d}
              stroke={tint}
              strokeWidth={2.6}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RIDGE_LENGTH}
              animatedProps={ridgeProps}
            />
          ))}
        </Svg>
        <Animated.View style={[line, { width: size * 0.8 }]} className="absolute h-0.5 rounded-full bg-gold-soft" />
      </View>
    </Animated.View>
  );
}
