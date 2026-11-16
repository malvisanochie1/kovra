import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/ui/Icon';
import { colors } from '@/theme/colors';

const steps: { icon: IconName; title: string; body: string }[] = [
  { icon: 'device', title: 'Describe it', body: 'Model, storage, condition and battery.' },
  { icon: 'bolt', title: 'Instant offer', body: 'See your price range immediately.' },
  { icon: 'shield', title: 'Quick check', body: 'In store, or we pick it up in Lagos.' },
  { icon: 'wallet', title: 'Get paid or swap', body: 'Transfer the same day, or upgrade.' },
];

/** Four steps joined by a gold line that draws itself down the list. */
export function HowItWorks() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withDelay(300, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) })));
  }, [progress]);

  const line = useAnimatedStyle(() => ({ height: `${progress.value * 100}%` }));

  return (
    <View className="rounded-[22px] border border-edge bg-ink-2 p-4 md:p-5">
      <Text className="mb-4 font-sora-semibold text-base text-snow md:text-lg">How trading works</Text>
      <View>
        <View className="absolute bottom-6 left-[19px] top-6 w-0.5 overflow-hidden rounded-full bg-white/10">
          <Animated.View style={line} className="w-full bg-gold" />
        </View>
        {steps.map((step, index) => (
          <View key={step.title} className={`flex-row gap-4 ${index < steps.length - 1 ? 'pb-4' : ''}`}>
            <View className="h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-ink-3">
              <Icon name={step.icon} size={18} color={colors.gold} />
            </View>
            <View className="flex-1 justify-center gap-0.5">
              <Text className="font-sora-semibold text-sm text-snow">
                {index + 1}. {step.title}
              </Text>
              <Text className="font-sora text-xs text-mist">{step.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
