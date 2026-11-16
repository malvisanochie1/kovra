import type { Product } from '@kovra/shared';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { cellWidth, useLayout } from '@/lib/layout';
import { rise, slideIn } from '@/theme/entering';
import { ProductCard } from './ProductCard';

const GAP = 14;

/** Responsive grid: 2 columns on phones up to 5 on wide desktops. */
export function ProductGrid({ products }: { products: Product[] }) {
  const { contentWidth, columns } = useLayout();
  const width = cellWidth(contentWidth, columns, GAP);

  return (
    <View className="flex-row flex-wrap" style={{ gap: GAP }}>
      {products.map((product, index) => (
        <Animated.View key={product.id} entering={rise(index % (columns * 3))}>
          <ProductCard product={product} width={width} />
        </Animated.View>
      ))}
    </View>
  );
}

/** Horizontal, snapping row of cards that bleeds to the screen edge. */
export function ProductRail({ products }: { products: Product[] }) {
  const { isTablet, gutter } = useLayout();
  const width = isTablet ? 230 : 176;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={width + GAP}
      contentContainerStyle={{ gap: GAP, paddingHorizontal: gutter }}
      style={{ marginHorizontal: -gutter }}
    >
      {products.map((product, index) => (
        <Animated.View key={product.id} entering={slideIn(index)}>
          <ProductCard product={product} width={width} />
        </Animated.View>
      ))}
    </ScrollView>
  );
}
