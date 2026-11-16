import { business } from '@kovra/shared';
import { Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Marquee } from '@/components/ui/Marquee';
import { colors } from '@/theme/colors';

const promises = [
  ...business.promise,
  'Nationwide delivery',
  `${business.warrantyDays}-day warranty`,
  'Swapping allowed',
  'Tested devices',
];

/** "Reliable · Trusted · Affordable" from the flyer, as a slow gold ribbon. */
export function Promises() {
  return (
    <View className="border-y border-gold/20 bg-gold/5 py-3">
      <Marquee>
        {promises.map((label) => (
          <View key={label} className="flex-row items-center gap-5 pr-5">
            <Text className="font-sora-semibold text-[13px] uppercase tracking-[2px] text-gold-soft">{label}</Text>
            <Icon name="sparkle" size={12} color={colors.gold} filled />
          </View>
        ))}
      </Marquee>
    </View>
  );
}
