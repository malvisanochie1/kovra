import { formatNaira } from '@kovra/shared';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProductVisual } from '@/features/catalog/ProductVisual';
import { useCountUp } from '@/hooks/useCountUp';
import { TRAY_HEIGHT, useLayout } from '@/lib/layout';
import { useCart, useCartCount, useCartSubtotal } from '@/store/cart';
import { useCatalog } from '@/store/catalog';
import { useTray } from '@/store/tray';
import { colors } from '@/theme/colors';
import { spring } from '@/theme/motion';
import { trayFrame } from './geometry';

/** Up to three product thumbnails fanned inside the tray's well. */
function Well() {
  const lines = useCart((s) => s.lines);
  const byId = useCatalog((s) => s.byId);
  const recent = lines.slice(-3).reverse();

  return (
    <View className="h-11 w-11 items-center justify-center rounded-xl border border-edge bg-ink">
      {recent.length === 0 && <Icon name="bag" size={18} color={colors.dim} />}
      {recent.map((line, index) => {
        const product = byId[line.productId];
        if (!product) return null;
        const hex = product.colors.find((c) => c.name === line.color)?.hex;
        return (
          <View
            key={line.key}
            style={[
              styles.thumb,
              { transform: [{ translateX: (index - 1) * -5 }, { rotate: `${(index - 1) * -10}deg` }], zIndex: 3 - index },
            ]}
          >
            <ProductVisual product={product} color={hex} height={34} />
          </View>
        );
      })}
    </View>
  );
}

/**
 * The Bag Tray: a slim bar that rests on the dock with the bag's count and running
 * total. Products are pulled into its well, and it stretches open to catch them.
 */
export function BagTray() {
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const total = useCountUp(subtotal);
  const { placement, inFlight, landings } = useTray();

  const visible = placement !== 'hidden' && (count > 0 || inFlight > 0);
  const frame = trayFrame(layout, insets.bottom, placement === 'hidden' ? 'dock' : placement);

  const shown = useSharedValue(0);
  const stretch = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    shown.set(withSpring(visible ? 1 : 0, spring.calm));
  }, [visible, shown]);

  useEffect(() => {
    if (landings === 0) return;
    stretch.set(withSequence(withTiming(1.05, { duration: 140, easing: Easing.out(Easing.quad) }), withSpring(1, spring.soft)));
    glow.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 700 })));
  }, [landings, stretch, glow]);

  const container = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 24 }, { scaleX: stretch.value }, { scaleY: 0.9 + shown.value * 0.1 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.root, { left: frame.left, bottom: frame.bottom, width: frame.width }, container]}
    >
      <PressableScale
        onPress={() => router.push('/bag')}
        pressedScale={0.97}
        accessibilityLabel={`Open bag: ${count} ${count === 1 ? 'item' : 'items'}, ${formatNaira(subtotal)}`}
        style={styles.bar}
        className="flex-row items-center gap-3 rounded-2xl border border-gold/30 bg-ink-3 pl-1.5 pr-2"
      >
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glow, glowStyle]} />
        <Well />
        <View className="flex-1">
          <Text className="font-sora text-[11px] text-mist">
            {count === 0 ? 'Adding to your bag…' : `${count} ${count === 1 ? 'item' : 'items'} in your bag`}
          </Text>
          <Text numberOfLines={1} className="font-sora-bold text-base text-gold">
            {formatNaira(total)}
          </Text>
        </View>
        <View className="h-10 flex-row items-center gap-1.5 rounded-xl bg-gold px-3.5">
          <Text className="font-sora-semibold text-[13px] text-ink">View</Text>
          <Icon name="arrow" size={16} color={colors.ink} strokeWidth={2.2} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', height: TRAY_HEIGHT },
  bar: {
    height: TRAY_HEIGHT,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  glow: { borderRadius: 16, borderWidth: 1.5, borderColor: colors.gold, backgroundColor: 'rgba(227,191,110,0.10)' },
  thumb: { position: 'absolute' },
});
