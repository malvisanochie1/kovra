import { business } from '@kovra/shared';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Aurora } from '@/components/brand/Aurora';
import { Button } from '@/components/ui/Button';
import { useLoop } from '@/hooks/useLoop';
import { useSession } from '@/store/session';
import { spring } from '@/theme/motion';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const MARK = 132;
// Perimeter of the 40×40 frame with 12pt corners, and the length of the K's strokes.
const FRAME_LENGTH = 4 * (40 - 24) + 2 * Math.PI * 12;
const K_LENGTH = 48;
const WORD = 'KOVRA'.split('');
const pillars = ['Phones', 'Gadgets', 'Sell', 'Swap', 'Nationwide'];

/** The monogram drawing itself: frame, then the K, then the spark. */
function IgnitionMark() {
  const frame = useSharedValue(0);
  const letter = useSharedValue(0);
  const spark = useSharedValue(0);
  const orbit = useLoop({ duration: 24000, easing: Easing.linear });

  useEffect(() => {
    frame.set(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }));
    letter.set(withDelay(650, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
    spark.set(withDelay(1250, withSpring(1, { ...spring.soft, damping: 9 })));
  }, [frame, letter, spark]);

  const frameProps = useAnimatedProps(() => ({ strokeDashoffset: FRAME_LENGTH * (1 - frame.value), fillOpacity: frame.value }));
  const letterProps = useAnimatedProps(() => ({ strokeDashoffset: K_LENGTH * (1 - letter.value) }));
  const sparkStyle = useAnimatedStyle(() => ({ opacity: spark.value, transform: [{ scale: spark.value }] }));
  const orbitStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${orbit.value * 360}deg` }] }));

  return (
    <View style={{ width: MARK * 2.2, height: MARK * 2.2 }} className="items-center justify-center">
      <Animated.View style={[{ position: 'absolute', width: MARK * 2.2, height: MARK * 2.2 }, orbitStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="92" stroke="rgba(227,191,110,0.28)" strokeWidth={0.8} strokeDasharray="1 6" fill="none" />
          <Circle cx="100" cy="100" r="74" stroke="rgba(91,124,255,0.22)" strokeWidth={0.8} fill="none" />
          <Circle cx="100" cy="8" r="3" fill="#E3BF6E" />
          <Circle cx="174" cy="100" r="2.2" fill="#5B7CFF" />
          <Circle cx="35" cy="152" r="1.8" fill="#F4DEA4" />
        </Svg>
      </Animated.View>

      <Svg width={MARK} height={MARK} viewBox="0 0 48 48">
        <Defs>
          <LinearGradient id="ignite" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F7E3AE" />
            <Stop offset="0.55" stopColor="#E3BF6E" />
            <Stop offset="1" stopColor="#A87C2E" />
          </LinearGradient>
        </Defs>
        <AnimatedRect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="#111933"
          stroke="url(#ignite)"
          strokeWidth={1.2}
          strokeDasharray={FRAME_LENGTH}
          animatedProps={frameProps}
        />
        <AnimatedPath
          d="M18 15v18M30 15 20.5 24l9.5 9"
          stroke="url(#ignite)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={K_LENGTH}
          animatedProps={letterProps}
        />
      </Svg>
      <Animated.View style={[{ position: 'absolute', top: MARK * 0.62, right: MARK * 0.66 }, sparkStyle]}>
        <Svg width={20} height={20} viewBox="0 0 12 12">
          <Path d="M6 0c.4 3.2 1.6 4.4 6 6-4.4 1.6-5.6 2.8-6 6-.4-3.2-1.6-4.4-6-6 4.4-1.6 5.6-2.8 6-6Z" fill="#F4DEA4" />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default function Intro() {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSession((s) => s.completeOnboarding);

  const enter = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-ink">
      <Aurora variant="hero" />
      <View className="flex-1 items-center justify-center px-8">
        <IgnitionMark />

        <View className="mt-2 flex-row gap-2">
          {WORD.map((char, index) => (
            <Animated.Text
              key={index}
              entering={FadeInDown.delay(1350 + index * 70).duration(500)}
              className="font-sora-bold text-[34px] tracking-[6px] text-snow"
            >
              {char}
            </Animated.Text>
          ))}
        </View>
        <Animated.Text entering={FadeIn.delay(1900).duration(700)} className="mt-3 text-center font-sora text-[15px] text-mist">
          {business.tagline}
        </Animated.Text>

        <View className="mt-8 flex-row flex-wrap justify-center gap-2">
          {pillars.map((label, index) => (
            <Animated.View
              key={label}
              entering={FadeInDown.delay(2150 + index * 90).duration(450)}
              className="rounded-lg border border-edge bg-ink-2/80 px-3 py-1.5"
            >
              <Text className="font-sora-medium text-xs text-snow">{label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(2700).duration(600)}
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
        className="w-full max-w-[460px] gap-4 self-center px-6"
      >
        <Button label="Enter the store" trailingIcon="arrow" shine onPress={enter} />
        <Text className="text-center font-sora text-xs text-dim">{business.promise.join('  ·  ')}</Text>
      </Animated.View>
    </View>
  );
}
