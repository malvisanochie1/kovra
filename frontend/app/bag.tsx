import { FREE_DELIVERY_THRESHOLD, formatNaira, unitPrice } from '@kovra/shared';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Container, EmptyState } from '@/components/ui/primitives';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { ProductVisual } from '@/features/catalog/ProductVisual';
import { useCountUp } from '@/hooks/useCountUp';
import { MAX_QUANTITY, useCart, useCartSubtotal, type CartLine } from '@/store/cart';
import { useCatalog } from '@/store/catalog';
import { colors } from '@/theme/colors';
import { spring } from '@/theme/motion';

function Line({ line, index }: { line: CartLine; index: number }) {
  const product = useCatalog((s) => s.byId[line.productId]);
  const { setQuantity, remove } = useCart();
  if (!product) return null;
  const hex = product.colors.find((c) => c.name === line.color)?.hex;
  const variant = [line.color, line.storage].filter(Boolean).join(' · ');

  return (
    <Reveal index={index} className="flex-row gap-4 rounded-[22px] border border-edge bg-ink-2 p-3">
      <PressableScale
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
        className="h-24 w-20 items-center justify-center rounded-2xl bg-ink-3"
        accessibilityLabel={`View ${product.name}`}
      >
        <ProductVisual product={product} color={hex} height={80} />
      </PressableScale>
      <View className="flex-1 justify-between py-1">
        <View className="flex-row items-start gap-2">
          <View className="flex-1">
            <Text numberOfLines={1} className="font-sora-semibold text-[15px] text-snow">
              {product.name}
            </Text>
            {variant ? <Text className="font-sora text-xs text-mist">{variant}</Text> : null}
          </View>
          <PressableScale onPress={() => remove(line.key)} hitSlop={10} accessibilityLabel={`Remove ${product.name}`}>
            <Icon name="trash" size={18} color={colors.dim} />
          </PressableScale>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-sora-bold text-base text-gold">{formatNaira(unitPrice(product, line.storage) * line.quantity)}</Text>
          <QuantityStepper value={line.quantity} max={Math.min(MAX_QUANTITY, product.stock)} onChange={(q) => setQuantity(line.key, q)} />
        </View>
      </View>
    </Reveal>
  );
}

/** How close the bag is to free delivery, as a filling gold meter. */
function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const progress = useSharedValue(0);
  const ratio = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  useEffect(() => {
    progress.set(withSpring(ratio, spring.glide));
  }, [ratio, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View className="gap-3 rounded-[22px] border border-edge bg-ink-2 p-4">
      <View className="flex-row items-center gap-3">
        <Icon name="truck" size={20} color={ratio >= 1 ? colors.success : colors.gold} />
        <Text className="flex-1 font-sora text-sm text-snow">
          {ratio >= 1 ? 'Free delivery unlocked, anywhere in Nigeria' : `${formatNaira(remaining)} away from free delivery`}
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-white/10">
        <Animated.View style={fill} className={`h-full rounded-full ${ratio >= 1 ? 'bg-success' : 'bg-gold'}`} />
      </View>
    </View>
  );
}

export default function Bag() {
  useTrayPlacement('hidden');
  const insets = useSafeAreaInsets();
  const lines = useCart((s) => s.lines);
  const subtotal = useCartSubtotal();
  const total = useCountUp(subtotal, 450);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <View className="flex-1 bg-ink">
      <ScreenHeader title={`Your bag${count ? ` · ${count}` : ''}`} />
      {lines.length === 0 ? (
        <EmptyState
          icon="bag"
          title="Your bag is empty"
          body="Find your next phone or a gadget to go with it. Anything you add appears here."
        >
          <Button label="Start exploring" trailingIcon="arrow" onPress={() => router.replace('/(tabs)/explore')} />
        </EmptyState>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Container narrow className="gap-3">
              <FreeDeliveryMeter subtotal={subtotal} />
              {lines.map((line, index) => (
                <Line key={line.key} line={line} index={index} />
              ))}
            </Container>
          </ScrollView>
          <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="border-t border-edge bg-ink-2 pt-4">
            <Container narrow className="gap-4">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="font-sora text-xs text-mist">Subtotal</Text>
                  <Text className="font-sora-bold text-2xl text-snow">{formatNaira(total)}</Text>
                </View>
                <Text className="pb-1 font-sora text-xs text-dim">Delivery calculated next</Text>
              </View>
              <Button label="Checkout" trailingIcon="arrow" shine onPress={() => router.push('/checkout')} />
            </Container>
          </View>
        </>
      )}
    </View>
  );
}
