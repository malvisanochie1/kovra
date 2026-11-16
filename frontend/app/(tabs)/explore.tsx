import type { CategoryId, Condition, Platform, Product } from '@kovra/shared';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScrollShell } from '@/components/ui/ScrollShell';
import { Chip, Container, EmptyState } from '@/components/ui/primitives';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { ProductGrid } from '@/features/catalog/ProductCollections';
import { useLayout } from '@/lib/layout';
import { useCatalog } from '@/store/catalog';
import { colors } from '@/theme/colors';

type Scope = 'all' | 'gadgets' | CategoryId;
type Sort = 'featured' | 'price-asc' | 'price-desc';

const scopes: { value: Scope; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'phones', label: 'Phones' },
  { value: 'gadgets', label: 'All gadgets' },
  { value: 'audio', label: 'Audio' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'power', label: 'Power' },
  { value: 'accessories', label: 'Accessories' },
];

const sortLabels: Record<Sort, string> = { featured: 'Featured', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low' };
const nextSort: Record<Sort, Sort> = { featured: 'price-asc', 'price-asc': 'price-desc', 'price-desc': 'featured' };

function matches(product: Product, query: string) {
  const haystack = `${product.brand} ${product.name} ${product.tagline}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

type ExploreParams = { category?: string; brand?: string; condition?: string; focus?: string };

export default function Explore() {
  useTrayPlacement('dock');
  // Links from the storefront ("See all Samsung", "UK-used deals"…) arrive as params.
  // Keying on them resets the filters to match whenever a new link is followed.
  const params = useLocalSearchParams<ExploreParams>();
  return <ExploreView key={JSON.stringify(params)} params={params} />;
}

function ExploreView({ params }: { params: ExploreParams }) {
  const { gutter } = useLayout();
  const products = useCatalog((s) => s.products);
  const searchRef = useRef<TextInputInstance>(null);

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>((params.category as Scope) ?? 'all');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [condition, setCondition] = useState<Condition | null>((params.condition as Condition) ?? null);
  const [brand, setBrand] = useState<string | null>(params.brand ?? null);
  const [sort, setSort] = useState<Sort>('featured');

  useEffect(() => {
    if (!params.focus) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [params.focus]);

  const results = useMemo(() => {
    const list = products.filter(
      (p) =>
        (scope === 'all' || (scope === 'gadgets' ? p.category !== 'phones' : p.category === scope)) &&
        (!platform || p.platform === platform) &&
        (!condition || p.condition === condition) &&
        (!brand || p.brand === brand) &&
        (!query.trim() || matches(p, query.trim())),
    );
    if (sort === 'featured') return list;
    return [...list].sort((a, b) => (sort === 'price-asc' ? a.price - b.price : b.price - a.price));
  }, [products, scope, platform, condition, brand, query, sort]);

  const filtersActive = scope !== 'all' || platform || condition || brand || query;
  const reset = () => {
    setScope('all');
    setPlatform(null);
    setCondition(null);
    setBrand(null);
    setQuery('');
  };

  return (
    <ScrollShell
      title="Explore"
      heading={{
        title: 'Explore',
        subtitle: `${results.length} ${results.length === 1 ? 'device' : 'devices'}${brand ? ` from ${brand}` : ''}`,
      }}
    >
      <Container className="gap-5">
        <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-edge bg-ink-2 px-4">
          <Icon name="search" size={20} color={colors.dim} />
          <TextInput
            ref={searchRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search phones & gadgets"
            placeholderTextColor={colors.dim}
            selectionColor={colors.gold}
            returnKeyType="search"
            accessibilityLabel="Search"
            className="h-full flex-1 font-sora text-[15px] text-snow outline-none"
          />
          {query.length > 0 && (
            <PressableScale onPress={() => setQuery('')} accessibilityLabel="Clear search" hitSlop={10}>
              <Icon name="close" size={18} color={colors.mist} />
            </PressableScale>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -gutter }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: gutter }}
        >
          {scopes.map((s) => (
            <Chip key={s.value} label={s.label} active={scope === s.value} onPress={() => setScope(s.value)} />
          ))}
        </ScrollView>

        <View className="flex-row flex-wrap items-center gap-2">
          <Chip label="iPhone" icon="device" active={platform === 'ios'} onPress={() => setPlatform(platform === 'ios' ? null : 'ios')} />
          <Chip
            label="Android"
            icon="device"
            active={platform === 'android'}
            onPress={() => setPlatform(platform === 'android' ? null : 'android')}
          />
          <Chip label="Brand new" active={condition === 'new'} onPress={() => setCondition(condition === 'new' ? null : 'new')} />
          <Chip label="UK-used" active={condition === 'uk-used'} onPress={() => setCondition(condition === 'uk-used' ? null : 'uk-used')} />
          {brand && <Chip label={`${brand}  ✕`} active onPress={() => setBrand(null)} />}
          <View className="flex-1" />
          <PressableScale
            onPress={() => setSort(nextSort[sort])}
            className="h-10 flex-row items-center gap-2 px-1"
            accessibilityLabel={`Sort: ${sortLabels[sort]}`}
          >
            <Icon name="refresh" size={16} color={colors.gold} />
            <Text className="font-sora-medium text-sm text-gold">{sortLabels[sort]}</Text>
          </PressableScale>
        </View>

        {results.length > 0 ? (
          <ProductGrid key={`${scope}-${platform}-${condition}-${brand}-${sort}`} products={results} />
        ) : (
          <EmptyState icon="search" title="Nothing matches yet" body="Try another search or clear the filters. New stock lands every week.">
            {filtersActive && <Button label="Clear filters" variant="glass" size="md" onPress={reset} />}
          </EmptyState>
        )}
      </Container>
    </ScrollShell>
  );
}
