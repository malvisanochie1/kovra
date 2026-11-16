import { findTradeModel, formatNaira, quoteTrade, type DeviceGrade } from '@kovra/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { Chip } from '@/components/ui/primitives';
import { useCountUp } from '@/hooks/useCountUp';
import { colors } from '@/theme/colors';

const POPULAR = ['iphone-13', 'iphone-14-pro-max', 'iphone-15-pro', 'galaxy-s24-ultra', 'pixel-8', 'iphone-12'];

const grades: { value: DeviceGrade; label: string }[] = [
  { value: 'flawless', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Worn' },
];

/** "What's your phone worth?" An instant estimate right on the storefront. */
export function TradeEstimator() {
  const [modelId, setModelId] = useState(POPULAR[0]!);
  const [grade, setGrade] = useState<DeviceGrade>('good');
  const model = findTradeModel(modelId)!;
  const quote = quoteTrade({ modelId, storage: model.storage[0]!.label, grade, battery: 'above-90', hasBox: false });
  const offer = useCountUp(quote?.offer ?? 0);

  return (
    <View className="gap-5 rounded-[28px] border border-gold/25 bg-ink-2 p-5 md:p-8">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
          <Icon name="wallet" size={22} color={colors.gold} />
        </View>
        <View className="flex-1">
          <Text className="font-sora-semibold text-lg text-snow">What’s your phone worth?</Text>
          <Text className="font-sora text-xs text-mist">Instant estimate. Sell it or swap it towards a new one.</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {POPULAR.map((id) => (
          <Chip key={id} label={findTradeModel(id)!.name} active={id === modelId} onPress={() => setModelId(id)} />
        ))}
      </ScrollView>

      <Segmented options={grades} value={grade} onChange={setGrade} />

      <View className="gap-1 rounded-2xl border border-edge bg-ink p-4">
        <Text className="font-sora text-xs text-mist">Estimated offer · {model.storage[0]!.label}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit className="font-sora-bold text-[30px] text-gold">
          {formatNaira(offer)}
        </Text>
        <Text className="font-sora text-[11px] text-dim">Confirmed after a quick inspection</Text>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label="Sell"
            variant="glass"
            size="md"
            onPress={() => router.push({ pathname: '/trade/[kind]', params: { kind: 'sell', model: modelId } })}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Swap up"
            size="md"
            icon="swap"
            onPress={() => router.push({ pathname: '/trade/[kind]', params: { kind: 'swap', model: modelId } })}
          />
        </View>
      </View>
    </View>
  );
}
