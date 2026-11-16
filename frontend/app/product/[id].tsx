import { business, conditionLabels, discountPercent, formatNaira, unitPrice } from '@kovra/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type HostInstance } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora } from '@/components/brand/Aurora';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Badge, Chip, Container, EmptyState, Rating, SectionHeader } from '@/components/ui/primitives';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PURCHASE_BAR_HEIGHT } from '@/features/bag/geometry';
import { useAddToBag } from '@/features/bag/useAddToBag';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { FlipViewer } from '@/features/catalog/FlipViewer';
import { VaultButton } from '@/features/vault/VaultButton';
import { useCountUp } from '@/hooks/useCountUp';
import { withAlpha } from '@/lib/color';
import { useLayout } from '@/lib/layout';
import { useProduct } from '@/store/catalog';
import { colors } from '@/theme/colors';
import { rise } from '@/theme/entering';

const promises: { icon: IconName; title: string; body: string }[] = [
  { icon: 'shield', title: 'Tested before it ships', body: 'Every device is checked by our technicians.' },
  { icon: 'clock', title: `${business.warrantyDays}-day store warranty`, body: 'On UK-used devices, on top of any maker’s warranty.' },
  { icon: 'truck', title: 'Nationwide delivery', body: 'Same day in Lagos, 1–4 days elsewhere.' },
];

export default function ProductScreen() {
  useTrayPlacement('screen');
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);
  const insets = useSafeAreaInsets();
  const { isTablet, width } = useLayout();
  const addToBag = useAddToBag();
  const stageRef = useRef<HostInstance>(null);

  const [colorName, setColorName] = useState(product?.colors[0]?.name);
  const [storage, setStorage] = useState(product?.storage?.[0]?.label);
  const price = product ? unitPrice(product, storage) : 0;
  const shownPrice = useCountUp(price, 500);

  if (!product) {
    return (
      <View className="flex-1 bg-ink">
        <ScreenHeader title="Not found" />
        <EmptyState icon="search" title="This device isn’t available" body="It may have sold out. Have a look at what’s in stock.">
          <Button label="Explore the store" onPress={() => router.replace('/(tabs)/explore')} />
        </EmptyState>
      </View>
    );
  }

  const color = product.colors.find((c) => c.name === colorName) ?? product.colors[0]!;
  const discount = discountPercent(product);
  const stageHeight = isTablet ? Math.min(520, width * 0.4) : 340;

  return (
    <View className="flex-1 bg-ink">
      <ScrollView contentContainerStyle={{ paddingBottom: PURCHASE_BAR_HEIGHT + insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: stageHeight + 260 }]}>
          <Aurora variant="hero" />
          <LinearGradient colors={[withAlpha(color.hex, 0.16), 'rgba(5,7,15,0)']} style={StyleSheet.absoluteFill} />
        </View>

        <ScreenHeader title="" right={<VaultButton productId={product.id} size={44} />} fallbackHref="/" />

        <Container className="gap-8 md:flex-row md:items-start md:gap-12">
          <Animated.View entering={rise(0)} ref={stageRef} collapsable={false} className="md:flex-1">
            <FlipViewer product={product} color={color.hex} height={stageHeight} />
          </Animated.View>

          <View className="gap-7 md:flex-1">
            <Animated.View entering={rise(1)} className="gap-3">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="font-sora-medium text-xs uppercase tracking-[2px] text-dim">{product.brand}</Text>
                <Badge label={conditionLabels[product.condition]} tone={product.condition === 'new' ? 'gold' : 'azure'} />
                {discount && <Badge label={`Save ${discount}%`} tone="success" />}
              </View>
              <Text className="font-sora-bold text-[32px] leading-10 text-snow md:text-[40px] md:leading-[48px]" accessibilityRole="header">
                {product.name}
              </Text>
              <Text className="font-sora text-[15px] leading-6 text-mist">{product.tagline}</Text>
              <View className="flex-row items-center gap-4">
                <Text className="font-sora-bold text-[26px] text-gold">{formatNaira(shownPrice)}</Text>
                {product.compareAtPrice && storage === product.storage?.[0]?.label && (
                  <Text className="font-sora text-sm text-dim line-through">{formatNaira(product.compareAtPrice)}</Text>
                )}
                <Rating value={product.rating} count={product.reviewCount} />
              </View>
            </Animated.View>

            <Animated.View entering={rise(2)} className="gap-3">
              <Text className="font-sora-medium text-xs text-mist">
                Colour · <Text className="text-snow">{color.name}</Text>
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {product.colors.map((c) => {
                  const selected = c.name === color.name;
                  return (
                    <PressableScale
                      key={c.name}
                      onPress={() => setColorName(c.name)}
                      pressedScale={0.88}
                      accessibilityLabel={c.name}
                      accessibilityState={{ selected }}
                      className={`h-12 w-12 items-center justify-center rounded-2xl border-2 ${selected ? 'border-gold' : 'border-transparent'}`}
                    >
                      <View style={{ backgroundColor: c.hex }} className="h-9 w-9 rounded-xl border border-white/20" />
                    </PressableScale>
                  );
                })}
              </View>
            </Animated.View>

            {product.storage && product.storage.length > 1 && (
              <Animated.View entering={rise(3)} className="gap-3">
                <Text className="font-sora-medium text-xs text-mist">Storage</Text>
                <View className="flex-row flex-wrap gap-2">
                  {product.storage.map((s) => (
                    <Chip
                      key={s.label}
                      label={s.priceDelta ? `${s.label}  +${formatNaira(s.priceDelta)}` : s.label}
                      active={s.label === storage}
                      onPress={() => setStorage(s.label)}
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            {product.category === 'phones' && (
              <Animated.View entering={rise(4)}>
                <PressableScale
                  onPress={() => router.push({ pathname: '/trade/[kind]', params: { kind: 'swap', target: product.id } })}
                  className="flex-row items-center gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-4"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
                    <Icon name="swap" size={22} color={colors.gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sora-semibold text-[15px] text-snow">Swap your phone for this</Text>
                    <Text className="font-sora text-xs text-mist">Get an instant trade-in value and pay only the difference.</Text>
                  </View>
                  <Icon name="forward" size={18} color={colors.gold} />
                </PressableScale>
              </Animated.View>
            )}

            <View>
              <SectionHeader title="Spec sheet" />
              <View className="flex-row flex-wrap gap-2.5">
                {product.specs.map((spec) => (
                  <View key={spec.label} className="min-w-[46%] flex-1 gap-1 rounded-2xl border border-edge bg-ink-2 p-4">
                    <Text className="font-sora text-[11px] uppercase tracking-[1.2px] text-dim">{spec.label}</Text>
                    <Text className="font-sora-medium text-sm text-snow">{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text className="font-sora text-[15px] leading-7 text-mist">{product.description}</Text>

            <View className="gap-3">
              {promises.map((p) => (
                <View key={p.title} className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-xl border border-edge bg-ink-2">
                    <Icon name={p.icon} size={18} color={colors.gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sora-semibold text-sm text-snow">{p.title}</Text>
                    <Text className="font-sora text-xs text-mist">{p.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Container>
      </ScrollView>

      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12), minHeight: PURCHASE_BAR_HEIGHT }}
        className="absolute bottom-0 left-0 right-0 justify-center border-t border-edge bg-ink-2 pt-3"
      >
        <Container className="flex-row items-center gap-4">
          <View className="flex-1">
            <Text numberOfLines={1} className="font-sora text-xs text-mist">
              {color.name}
              {storage ? ` · ${storage}` : ''}
            </Text>
            <Text numberOfLines={1} className="font-sora-bold text-lg text-snow">
              {formatNaira(price)}
            </Text>
          </View>
          <View className="w-[56%] max-w-[320px]">
            <Button
              label={product.stock > 0 ? 'Add to bag' : 'Sold out'}
              icon="bag"
              shine
              disabled={product.stock === 0}
              onPress={() => addToBag(product, stageRef.current, { color: color.name, storage })}
            />
          </View>
        </Container>
      </View>
    </View>
  );
}
