import {
  batteryLabels,
  formatNaira,
  gradeLabels,
  tradeModels,
  unitPrice,
  type BatteryBand,
  type DeviceGrade,
  type Product,
  type SwapQuote,
  type TradeDevice,
  type TradeModel,
  type TradeQuote,
} from '@kovra/shared';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { Field } from '@/components/ui/Field';
import { OptionCard } from '@/components/ui/OptionCard';
import { Segmented } from '@/components/ui/Segmented';
import { Chip } from '@/components/ui/primitives';
import { ProductVisual } from '@/features/catalog/ProductVisual';
import { useCountUp } from '@/hooks/useCountUp';
import { useLayout } from '@/lib/layout';
import type { Errors } from '@/lib/validation';

const brands = [...new Set(tradeModels.map((m) => m.brand))];

export function StepTitle({ title, body }: { title: string; body: string }) {
  return (
    <View className="gap-1.5">
      <Text className="font-sora-bold text-2xl text-snow" accessibilityRole="header">
        {title}
      </Text>
      <Text className="font-sora text-sm leading-6 text-mist">{body}</Text>
    </View>
  );
}

export function DeviceStep({ modelId, onSelect }: { modelId: string | null; onSelect: (model: TradeModel) => void }) {
  const { gutter } = useLayout();
  const [brand, setBrand] = useState(tradeModels.find((m) => m.id === modelId)?.brand ?? brands[0]!);

  return (
    <View className="gap-5">
      <StepTitle title="Which phone do you have?" body="Pick the brand, then your exact model." />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -gutter }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: gutter }}
      >
        {brands.map((b) => (
          <Chip key={b} label={b} active={b === brand} onPress={() => setBrand(b)} />
        ))}
      </ScrollView>
      <View className="gap-2.5">
        {tradeModels
          .filter((m) => m.brand === brand)
          .map((model, index) => (
            <Reveal index={index} key={model.id}>
              <OptionCard
                title={model.name}
                detail={`Up to ${formatNaira(model.baseValue + (model.storage.at(-1)?.priceDelta ?? 0))}`}
                selected={model.id === modelId}
                onPress={() => onSelect(model)}
              />
            </Reveal>
          ))}
      </View>
    </View>
  );
}

interface ConditionStepProps {
  model: TradeModel;
  device: TradeDevice;
  onChange: (patch: Partial<TradeDevice>) => void;
}

export function ConditionStep({ model, device, onChange }: ConditionStepProps) {
  return (
    <View className="gap-6">
      <StepTitle title={`About your ${model.name}`} body="Be accurate and your final offer will match this estimate." />

      <View className="gap-3">
        <Text className="font-sora-medium text-xs text-mist">Storage</Text>
        <View className="flex-row flex-wrap gap-2">
          {model.storage.map((s) => (
            <Chip key={s.label} label={s.label} active={device.storage === s.label} onPress={() => onChange({ storage: s.label })} />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="font-sora-medium text-xs text-mist">Condition</Text>
        {(Object.keys(gradeLabels) as DeviceGrade[]).map((grade) => (
          <OptionCard
            key={grade}
            title={gradeLabels[grade].title}
            detail={gradeLabels[grade].detail}
            selected={device.grade === grade}
            onPress={() => onChange({ grade })}
          />
        ))}
      </View>

      <View className="gap-3">
        <Text className="font-sora-medium text-xs text-mist">Battery health</Text>
        <Segmented
          options={(Object.keys(batteryLabels) as BatteryBand[]).map((value) => ({
            value,
            label: batteryLabels[value].replace(' and above', '+'),
          }))}
          value={device.battery}
          onChange={(battery) => onChange({ battery })}
        />
      </View>

      <OptionCard
        title="I still have the box"
        detail="Adds a little to your offer"
        selected={device.hasBox}
        onPress={() => onChange({ hasBox: !device.hasBox })}
      />
    </View>
  );
}

export function TargetStep({ phones, targetId, onSelect }: { phones: Product[]; targetId: string | null; onSelect: (id: string) => void }) {
  return (
    <View className="gap-5">
      <StepTitle title="What are you swapping into?" body="Choose your next phone. We’ll take yours off the price." />
      <View className="gap-2.5">
        {phones.map((product, index) => (
          <Reveal index={index} key={product.id}>
            <OptionCard
              title={product.name}
              detail={`${product.condition === 'new' ? 'Brand new' : 'UK-used'} · ${formatNaira(unitPrice(product))}`}
              selected={product.id === targetId}
              onPress={() => onSelect(product.id)}
              aside={
                <View className="h-12 w-10 items-center justify-center">
                  <ProductVisual product={product} height={44} />
                </View>
              }
            />
          </Reveal>
        ))}
      </View>
    </View>
  );
}

interface OfferStepProps {
  quote: TradeQuote | SwapQuote;
  model: TradeModel;
  target?: Product;
  contact: { name: string; phone: string };
  errors: Errors<'name' | 'phone' | 'form'>;
  onContact: (patch: Partial<{ name: string; phone: string }>) => void;
}

export function OfferStep({ quote, model, target, contact, errors, onContact }: OfferStepProps) {
  const offer = useCountUp(quote.offer, 900);
  const topUp = 'topUp' in quote ? quote.topUp : null;
  const shownTopUp = useCountUp(topUp ?? 0, 900);
  const rows = useMemo(
    () =>
      target && topUp !== null
        ? [
            { label: target.name, value: formatNaira((quote as SwapQuote).targetPrice) },
            { label: `Your ${model.name}`, value: `− ${formatNaira(quote.offer)}` },
          ]
        : [],
    [model.name, quote, target, topUp],
  );

  return (
    <View className="gap-6">
      <View className="items-center gap-2 rounded-[28px] border border-gold/30 bg-ink-2 px-5 py-8">
        <Text className="font-sora-medium text-xs uppercase tracking-[2px] text-gold">Your estimated offer</Text>
        <Text className="font-sora-bold text-[44px] text-snow">{formatNaira(offer)}</Text>
        <Text className="font-sora text-xs text-mist">
          Range {formatNaira(quote.low)} – {formatNaira(quote.high)} · confirmed after a quick check
        </Text>
      </View>

      {topUp !== null && (
        <View className="gap-3 rounded-[24px] border border-edge bg-ink-2 p-5">
          {rows.map((row) => (
            <View key={row.label} className="flex-row justify-between gap-4">
              <Text className="flex-1 font-sora text-sm text-mist">{row.label}</Text>
              <Text className="font-sora-medium text-sm text-snow">{row.value}</Text>
            </View>
          ))}
          <View className="h-px bg-edge" />
          <View className="flex-row items-center justify-between">
            <Text className="font-sora-semibold text-base text-snow">You pay</Text>
            <Text className="font-sora-bold text-2xl text-gold">{formatNaira(shownTopUp)}</Text>
          </View>
        </View>
      )}

      <View className="gap-4">
        <Text className="font-sora-semibold text-base text-snow">Where should we send your offer?</Text>
        <Field
          label="Full name"
          icon="user"
          placeholder="Ada Obi"
          value={contact.name}
          onChangeText={(name) => onContact({ name })}
          error={errors.name}
        />
        <Field
          label="Phone number"
          icon="phone"
          placeholder="0803 123 4567"
          keyboardType="phone-pad"
          value={contact.phone}
          onChangeText={(phone) => onContact({ phone })}
          error={errors.phone}
        />
        {errors.form && <Text className="font-sora text-sm text-danger">{errors.form}</Text>}
      </View>
    </View>
  );
}
