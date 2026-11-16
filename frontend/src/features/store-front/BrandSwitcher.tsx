import type { Product } from '@kovra/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { Chip, SectionHeader } from '@/components/ui/primitives';
import { ProductCard } from '@/features/catalog/ProductCard';
import { cellWidth, useLayout } from '@/lib/layout';

const GAP = 14;

/** Pick a brand and its line-up swaps in place. */
export function BrandSwitcher({ products }: { products: Product[] }) {
  const { contentWidth, columns, gutter } = useLayout();
  const brands = useMemo(() => [...new Set(products.filter((p) => p.category === 'phones').map((p) => p.brand))], [products]);
  const [brand, setBrand] = useState(brands[0] ?? 'Apple');
  const lineup = products.filter((p) => p.brand === brand && p.category === 'phones').slice(0, columns * 2);
  const width = cellWidth(contentWidth, columns, GAP);

  return (
    <View>
      <SectionHeader
        eyebrow="By brand"
        title={`The ${brand} line-up`}
        action={{ label: 'See all', onPress: () => router.push({ pathname: '/explore', params: { brand } }) }}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -gutter, marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: gutter }}
      >
        {brands.map((name) => (
          <Chip key={name} label={name} active={name === brand} onPress={() => setBrand(name)} />
        ))}
      </ScrollView>
      <View className="flex-row flex-wrap" style={{ gap: GAP }}>
        {lineup.map((product) => (
          <Reveal key={`${brand}-${product.id}`}>
            <ProductCard product={product} width={width} />
          </Reveal>
        ))}
      </View>
    </View>
  );
}
