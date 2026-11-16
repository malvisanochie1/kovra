import { business } from '@kovra/shared';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { scenes } from '@/lib/scenes';

/** A slim reassurance strip above the UK-used range. */
export function WarrantyNote() {
  return (
    <View className="mb-3 flex-row items-center gap-3 rounded-2xl border border-gold/25 bg-ink-2 p-2 pr-4">
      <Image source={scenes['warranty-tested']} style={{ width: 56, height: 56, borderRadius: 12 }} contentFit="cover" transition={200} />
      <View className="flex-1 gap-0.5">
        <Text className="font-sora-semibold text-[13px] text-snow">Checked by hand before it’s listed</Text>
        <Text className="font-sora text-[11px] leading-4 text-mist">
          Battery, screen, cameras and Face ID tested, with a {business.warrantyDays}-day store warranty.
        </Text>
      </View>
    </View>
  );
}
