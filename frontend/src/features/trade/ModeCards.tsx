import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { DeviceArt } from '@/features/catalog/DeviceArt';
import { useLoop } from '@/hooks/useLoop';
import { colors } from '@/theme/colors';

function RisingNote({ lift, offset, left }: { lift: SharedValue<number>; offset: number; left: number }) {
  const style = useAnimatedStyle(() => {
    const t = (lift.value + offset) % 1;
    return {
      opacity: t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85,
      transform: [{ translateY: -t * 54 }, { rotate: `${(offset - 0.3) * 30}deg` }],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', bottom: 60, left }, style]}
      className="rounded-md border border-success/50 bg-success/15 px-1.5 py-0.5"
    >
      <Text className="font-sora-bold text-[10px] text-success">₦</Text>
    </Animated.View>
  );
}

/** Naira notes rising out of a phone: selling for cash. */
function SellArt() {
  const lift = useLoop({ duration: 2600, easing: Easing.linear });
  return (
    <View className="h-32 w-28 items-center justify-end">
      {[0, 0.33, 0.66].map((offset, i) => (
        <RisingNote key={offset} lift={lift} offset={offset} left={18 + i * 22} />
      ))}
      <DeviceArt kind="phone" brand="Apple" color="#3A3A3C" height={96} />
    </View>
  );
}

/** Two phones that trade places in a slow loop: swapping up. */
function SwapArt() {
  const t = useLoop({ duration: 3200, reverse: true });
  const a = useAnimatedStyle(() => ({
    transform: [{ translateX: -22 + t.value * 44 }, { scale: 0.86 + t.value * 0.14 }],
    zIndex: t.value > 0.5 ? 2 : 1,
  }));
  const b = useAnimatedStyle(() => ({
    transform: [{ translateX: 22 - t.value * 44 }, { scale: 1 - t.value * 0.14 }],
    zIndex: t.value > 0.5 ? 1 : 2,
  }));

  return (
    <View className="h-32 w-28 items-center justify-end">
      <Animated.View style={[{ position: 'absolute', bottom: 0 }, a]}>
        <DeviceArt kind="phone" brand="Samsung" color="#8E9CB0" height={96} />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', bottom: 0 }, b]}>
        <DeviceArt kind="phone" brand="Apple" color="#2B3A55" height={96} />
      </Animated.View>
    </View>
  );
}

const modes = [
  {
    kind: 'sell',
    title: 'Sell for cash',
    body: 'Instant offer for your used phone. Paid by transfer once it’s checked.',
    Art: SellArt,
    accent: 'text-success',
  },
  {
    kind: 'swap',
    title: 'Swap & upgrade',
    body: 'Trade your phone towards a new or UK-used one. Pay only the difference.',
    Art: SwapArt,
    accent: 'text-gold',
  },
] as const;

export function ModeCards() {
  return (
    <View className="gap-3 md:flex-row">
      {modes.map(({ kind, title, body, Art, accent }, index) => (
        <Reveal index={index + 1} key={kind} className="md:flex-1">
          <PressableScale
            onPress={() => router.push({ pathname: '/trade/[kind]', params: { kind } })}
            accessibilityLabel={title}
            className="flex-row items-center gap-4 overflow-hidden rounded-[24px] border border-edge bg-ink-2 p-5"
          >
            <View className="flex-1 gap-2">
              <Text className={`font-sora-semibold text-[11px] uppercase tracking-[2px] ${accent}`}>
                {kind === 'sell' ? 'Cash out' : 'Trade up'}
              </Text>
              <Text className="font-sora-bold text-xl text-snow">{title}</Text>
              <Text className="font-sora text-[13px] leading-5 text-mist">{body}</Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                <Text className="font-sora-semibold text-sm text-gold">Start</Text>
                <Icon name="arrow" size={16} color={colors.gold} />
              </View>
            </View>
            <Art />
          </PressableScale>
        </Reveal>
      ))}
    </View>
  );
}
