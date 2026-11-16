import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min = 1, max, onChange }: QuantityStepperProps) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <View className="h-10 flex-row items-center rounded-full border border-edge bg-ink-2">
      <PressableScale
        onPress={() => step(-1)}
        disabled={value <= min}
        accessibilityLabel="Decrease quantity"
        className={`h-10 w-10 items-center justify-center ${value <= min ? 'opacity-30' : ''}`}
      >
        <Icon name="minus" size={16} color={colors.snow} />
      </PressableScale>
      <View className="h-6 w-7 items-center justify-center overflow-hidden">
        <Animated.Text
          key={value}
          entering={FadeInDown.duration(220)}
          exiting={FadeOutUp.duration(160)}
          className="font-sora-semibold text-sm text-snow"
          accessibilityLabel={`Quantity ${value}`}
        >
          {value}
        </Animated.Text>
      </View>
      <PressableScale
        onPress={() => step(1)}
        disabled={value >= max}
        accessibilityLabel="Increase quantity"
        className={`h-10 w-10 items-center justify-center ${value >= max ? 'opacity-30' : ''}`}
      >
        <Icon name="plus" size={16} color={colors.snow} />
      </PressableScale>
    </View>
  );
}
