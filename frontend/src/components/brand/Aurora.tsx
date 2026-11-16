import { memo, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useLoop } from '@/hooks/useLoop';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Blob {
  color: string;
  size: number;
  top: `${number}%`;
  left: `${number}%`;
  drift: number;
  duration: number;
  opacity: number;
}

const presets: Record<'hero' | 'page', Blob[]> = {
  hero: [
    { color: '#E3BF6E', size: 340, top: '-20%', left: '45%', drift: 40, duration: 9000, opacity: 0.35 },
    { color: '#5B7CFF', size: 380, top: '30%', left: '-25%', drift: 50, duration: 11000, opacity: 0.3 },
    { color: '#2A3A8C', size: 300, top: '55%', left: '55%', drift: 36, duration: 13000, opacity: 0.45 },
  ],
  page: [
    { color: '#5B7CFF', size: 420, top: '-18%', left: '-30%', drift: 46, duration: 14000, opacity: 0.16 },
    { color: '#E3BF6E', size: 360, top: '-12%', left: '60%', drift: 40, duration: 12000, opacity: 0.12 },
  ],
};

function GlowBlob({ blob, index }: { blob: Blob; index: number }) {
  const t = useLoop({ duration: blob.duration, reverse: true });
  const id = `aurora${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const style = useAnimatedStyle(() => {
    const direction = index % 2 === 0 ? 1 : -1;
    return {
      transform: [
        { translateX: (t.value - 0.5) * blob.drift * 2 * direction },
        { translateY: (0.5 - t.value) * blob.drift * direction },
        { scale: 0.92 + t.value * 0.16 },
      ],
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute', top: blob.top, left: blob.left, width: blob.size, height: blob.size }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={blob.color} stopOpacity={blob.opacity} />
            <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Slow-drifting light behind content. Soft radial gradients stand in for a blur,
 * which keeps the effect cheap on mid-range Android phones.
 */
export const Aurora = memo(function Aurora({ variant = 'page' }: { variant?: 'hero' | 'page' }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {presets[variant].map((blob, index) => (
        <GlowBlob key={index} blob={blob} index={index} />
      ))}
    </View>
  );
});
