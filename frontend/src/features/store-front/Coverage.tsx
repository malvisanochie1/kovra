import { business, deliveryZones, FREE_DELIVERY_THRESHOLD, formatNaira } from '@kovra/shared';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useLoop } from '@/hooks/useLoop';
import { callStore, chatOnWhatsApp } from '@/lib/contact';
import { colors } from '@/theme/colors';

const zones = Object.values(deliveryZones);

function Beacon() {
  const pulse = useLoop({ duration: 1800 });
  const ring = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.7 }] }));
  return (
    <View className="h-12 w-12 items-center justify-center">
      <Animated.View style={ring} className="absolute h-12 w-12 rounded-full border-2 border-gold" />
      <View className="h-12 w-12 items-center justify-center rounded-full bg-gold/15">
        <Icon name="truck" size={22} color={colors.gold} />
      </View>
    </View>
  );
}

/** Delivery promise from the flyer: zones, fees and how to reach the store. */
export function Coverage() {
  return (
    <View className="gap-5 rounded-[28px] border border-edge bg-ink-2 p-5 md:p-8">
      <View className="flex-row items-center gap-4">
        <Beacon />
        <View className="flex-1">
          <Text className="font-sora-semibold text-lg text-snow">We deliver nationwide</Text>
          <Text className="font-sora text-xs text-mist">Free on orders over {formatNaira(FREE_DELIVERY_THRESHOLD)}</Text>
        </View>
      </View>

      <View className="gap-2 md:flex-row">
        {zones.map((zone, index) => (
          <Reveal
            index={index}
            key={zone.id}
            className="flex-row items-center justify-between rounded-2xl border border-edge bg-ink px-4 py-3 md:flex-1 md:flex-col md:items-start md:gap-1"
          >
            <View>
              <Text className="font-sora-medium text-sm text-snow">{zone.label}</Text>
              <Text className="font-sora text-xs text-mist">{zone.eta}</Text>
            </View>
            <Text className="font-sora-semibold text-sm text-gold">{formatNaira(zone.fee)}</Text>
          </Reveal>
        ))}
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button label="Call" icon="phone" variant="glass" size="md" onPress={callStore} />
        </View>
        <View className="flex-1">
          <Button label="WhatsApp" icon="chat" size="md" onPress={() => chatOnWhatsApp()} />
        </View>
      </View>
      <Text className="text-center font-sora text-xs text-dim">{business.phone}</Text>
    </View>
  );
}
