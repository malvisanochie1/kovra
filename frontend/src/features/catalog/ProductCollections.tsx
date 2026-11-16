import type { Product } from '@kovra/shared';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { cellWidth, useLayout } from '@/lib/layout';
import { ProductCard } from './ProductCard';

const GAP = 14;

/**
 * Renders the first rows straight away and the rest a few at a time on the
 * following frames, so a long grid never blocks the screen from appearing.
 */
function useProgressive<T>(items: T[], initial: number, step: number): T[] {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (count >= items.length) return;
    const frame = requestAnimationFrame(() => setCount((c) => c + step));
    return () => cancelAnimationFrame(frame);
  }, [count, items.length, step]);

  return items.slice(0, count);
}

/** Responsive grid, 2 to 5 columns. Each card rises into view as the page scrolls. */
export function ProductGrid({ products }: { products: Product[] }) {
  const { contentWidth, columns } = useLayout();
  const width = cellWidth(contentWidth, columns, GAP);
  const visible = useProgressive(products, columns * 2, columns);

  return (
    <View className="flex-row flex-wrap" style={{ gap: GAP }}>
      {visible.map((product) => (
        <ScrollReveal key={product.id}>
          <ProductCard product={product} width={width} />
        </ScrollReveal>
      ))}
    </View>
  );
}

function RailItem({
  product,
  index,
  width,
  scrollX,
  viewport,
}: {
  product: Product;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  viewport: number;
}) {
  // The device drifts slightly against the scroll, so it seems to sit deeper than its card.
  const parallax = useAnimatedStyle(() => {
    const centre = index * (width + GAP) + width / 2 - scrollX.get();
    const offset = Math.max(-1, Math.min(1, (centre - viewport / 2) / viewport));
    return { transform: [{ translateX: offset * -18 }, { rotate: `${offset * -4}deg` }] };
  });

  return <ProductCard product={product} width={width} visualStyle={parallax} />;
}

/** Horizontal, snapping, virtualised row of cards that bleeds to the screen edge. */
export function ProductRail({ products }: { products: Product[] }) {
  const { isTablet, gutter, width: viewport } = useLayout();
  const width = isTablet ? 230 : 176;
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.set(event.contentOffset.x);
  });

  return (
    <Animated.FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <RailItem product={item} index={index} width={width} scrollX={scrollX} viewport={viewport} />}
      horizontal
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={width + GAP}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      contentContainerStyle={{ gap: GAP, paddingHorizontal: gutter }}
      style={{ marginHorizontal: -gutter }}
    />
  );
}
