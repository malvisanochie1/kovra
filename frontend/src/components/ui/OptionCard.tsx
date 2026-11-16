import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors } from '@/theme/colors';

interface OptionCardProps {
  title: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  aside?: ReactNode;
}

/** A selectable row with a check that appears when chosen. */
export function OptionCard({ title, detail, selected, onPress, aside }: OptionCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.98}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${selected ? 'border-gold bg-gold/10' : 'border-edge bg-ink-2'}`}
    >
      <View className="flex-1 gap-0.5">
        <Text className="font-sora-semibold text-[15px] text-snow">{title}</Text>
        {detail && <Text className="font-sora text-xs text-mist">{detail}</Text>}
      </View>
      {aside}
      <View className={`h-6 w-6 items-center justify-center rounded-lg border ${selected ? 'border-gold bg-gold' : 'border-edge-strong'}`}>
        {selected && <Icon name="check" size={14} color={colors.ink} strokeWidth={2.6} />}
      </View>
    </PressableScale>
  );
}
