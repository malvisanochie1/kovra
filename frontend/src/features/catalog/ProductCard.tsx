import { conditionLabels, discountPercent, formatNaira, type Product } from '@kovra/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo, useRef } from 'react';
import { StyleSheet, Text, View, type HostInstance } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { withAlpha } from '@/lib/color';
import { colors, gradients } from '@/theme/colors';
import { useAddToBag } from '../bag/useAddToBag';
import { VaultButton } from '../vault/VaultButton';
import { ProductVisual } from './ProductVisual';

const badgeLabel = { new: 'New in', hot: 'Trending', deal: 'Deal' } as const;

/** Shortens a spec value for a card: `6.9" Super Retina XDR, 120Hz` becomes `6.9"`. */
const shortSpec = (value: string) => {
  const first = value.split(/[,·]/)[0]!.trim();
  return first.match(/^\d+(?:\.\d+)?"/)?.[0] ?? first;
};

/** The two headline specs, e.g. `6.9"  ·  A19 Pro`. */
export const specLine = (product: Product) =>
  product.specs
    .slice(0, 2)
    .map((spec) => shortSpec(spec.value))
    .join('  ·  ');

interface ProductCardProps {
  product: Product;
  width: number;
}

/** A "spec card": the device on a lit stage, its key specs, colourways and price. */
function ProductCardBase({ product, width }: ProductCardProps) {
  const stageRef = useRef<HostInstance>(null);
  const addToBag = useAddToBag();
  const discount = discountPercent(product);
  const tint = product.colors[0]?.hex ?? colors.gold;
  const tag = discount ? `-${discount}%` : product.badge ? badgeLabel[product.badge] : null;

  return (
    <View style={{ width }}>
      <PressableScale
        pressedScale={0.97}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
        accessibilityLabel={`${product.name}, ${formatNaira(product.price)}`}
        className="overflow-hidden rounded-[22px] border border-edge bg-ink-2"
      >
        <View style={{ height: width * 1.05 }} className="items-center justify-center overflow-hidden">
          <LinearGradient
            colors={['rgba(26,36,72,0.9)', withAlpha(tint, 0.18), 'rgba(10,15,30,0)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.floor, { width: width * 0.6, bottom: width * 0.1 }]} />
          <View ref={stageRef} collapsable={false}>
            <ProductVisual product={product} height={width * 0.8} />
          </View>
          <View className="absolute bottom-3 left-3 flex-row gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <View key={c.name} style={{ backgroundColor: c.hex }} className="h-2.5 w-2.5 rounded-full border border-white/30" />
            ))}
          </View>
        </View>

        <View className="gap-1.5 border-t border-edge px-3.5 pb-3.5 pt-3">
          <View className="flex-row items-center justify-between gap-2">
            <Text numberOfLines={1} className="flex-1 font-sora-medium text-[11px] uppercase tracking-[1.4px] text-dim">
              {product.brand}
            </Text>
            {product.condition !== 'new' && (
              <Text className="font-sora-semibold text-[10px] uppercase tracking-[1px] text-azure">
                {conditionLabels[product.condition]}
              </Text>
            )}
          </View>
          <Text numberOfLines={1} className="font-sora-semibold text-[15px] text-snow">
            {product.name}
          </Text>
          <Text numberOfLines={1} className="font-sora text-[11px] text-mist">
            {specLine(product)}
          </Text>
          <View className="mt-1 flex-row items-center justify-between gap-2">
            <View className="flex-1">
              <Text numberOfLines={1} adjustsFontSizeToFit className="font-sora-bold text-[15px] text-gold">
                {formatNaira(product.price)}
              </Text>
              {product.compareAtPrice && (
                <Text className="font-sora text-[11px] text-dim line-through">{formatNaira(product.compareAtPrice)}</Text>
              )}
            </View>
            <PressableScale
              onPress={() => addToBag(product, stageRef.current)}
              pressedScale={0.85}
              hitSlop={8}
              accessibilityLabel={`Add ${product.name} to bag`}
              className="h-10 w-10 items-center justify-center overflow-hidden rounded-xl"
            >
              <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View>
                <Icon name="bag" size={18} color={colors.ink} strokeWidth={2.1} />
              </View>
            </PressableScale>
          </View>
        </View>
      </PressableScale>

      {tag && (
        <View pointerEvents="none" className="absolute left-0 top-4 rounded-r-lg bg-gold px-2.5 py-1">
          <Text className="font-sora-bold text-[10px] uppercase tracking-[1px] text-ink">{tag}</Text>
        </View>
      )}
      <View className="absolute right-3 top-3">
        <VaultButton productId={product.id} size={34} />
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardBase);

const styles = StyleSheet.create({
  floor: { position: 'absolute', height: 14, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)' },
});
