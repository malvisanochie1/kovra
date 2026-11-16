import { conditionLabels, formatNaira, type Product } from '@kovra/shared';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Aurora } from '@/components/brand/Aurora';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProductVisual } from '@/features/catalog/ProductVisual';
import { TiltStage } from '@/features/catalog/TiltStage';
import { useLayout } from '@/lib/layout';

const ROTATE_MS = 7000;

/**
 * One hero device at a time on a tiltable pedestal, with a thumbnail selector.
 * It cycles on its own until the customer picks a device themselves.
 */
export function Spotlight({ products }: { products: Product[] }) {
  const { isTablet } = useLayout();
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [pinned, setPinned] = useState(false);
  const turn = useSharedValue(0);
  const product = products[shown]!;
  const stageHeight = isTablet ? 340 : 250;

  useEffect(() => {
    if (pinned) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % products.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [index, pinned, products.length]);

  // The current device swings away on one side and the next one swings in from the other.
  useEffect(() => {
    if (index === shown) return;
    const swapIn = () => {
      setShown(index);
      turn.set(-1);
      turn.set(withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }));
    };
    turn.set(
      withTiming(1, { duration: 300, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) runOnJS(swapIn)();
      }),
    );
  }, [index, shown, turn]);

  const device = useAnimatedStyle(() => {
    const t = turn.get();
    return {
      opacity: 1 - Math.abs(t),
      transform: [{ perspective: 900 }, { translateX: t * -46 }, { rotateY: `${t * 62}deg` }, { scale: 1 - Math.abs(t) * 0.1 }],
    };
  });

  const open = () => router.push({ pathname: '/product/[id]', params: { id: product.id } });

  return (
    <View className="overflow-hidden rounded-[28px] border border-edge bg-ink-2">
      <Aurora variant="hero" />
      <View className="gap-2 p-5 md:flex-row md:items-center md:gap-8 md:p-10">
        <View className="md:flex-1">
          <TiltStage height={stageHeight}>
            <Animated.View style={device}>
              <ProductVisual product={product} height={stageHeight * 0.86} />
            </Animated.View>
          </TiltStage>
          <Text className="mt-5 text-center font-sora text-[11px] text-dim">Drag to tilt</Text>
        </View>

        <View className="gap-4 md:flex-1">
          <Reveal key={product.id} className="gap-2">
            <Text className="font-sora-semibold text-[11px] uppercase tracking-[2px] text-gold">
              Spotlight · {product.badge === 'new' ? 'Just landed' : conditionLabels[product.condition]}
            </Text>
            <Text className="font-sora-bold text-[28px] leading-[34px] text-snow md:text-[40px] md:leading-[48px]">{product.name}</Text>
            <Text className="font-sora text-sm leading-6 text-mist md:text-base">{product.tagline}</Text>
            <Text className="font-sora-bold text-xl text-snow md:text-2xl">{formatNaira(product.price)}</Text>
          </Reveal>

          <View className="flex-row gap-2">
            {products.map((item, i) => (
              <PressableScale
                key={item.id}
                onPress={() => {
                  setPinned(true);
                  setIndex(i);
                }}
                accessibilityLabel={`Show ${item.name}`}
                accessibilityState={{ selected: i === shown }}
                className={`h-14 w-12 items-center justify-center rounded-xl border ${i === shown ? 'border-gold bg-gold/10' : 'border-edge bg-ink'}`}
              >
                <ProductVisual product={item} height={40} />
              </PressableScale>
            ))}
          </View>

          <View className="self-stretch md:self-start">
            <Button label="View details" trailingIcon="arrow" shine onPress={open} />
          </View>
        </View>
      </View>
    </View>
  );
}
