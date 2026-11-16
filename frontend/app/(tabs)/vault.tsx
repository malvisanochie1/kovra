import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Container, EmptyState, SectionHeader } from '@/components/ui/primitives';
import { ScrollShell } from '@/components/ui/ScrollShell';
import { Segmented } from '@/components/ui/Segmented';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { ProductGrid } from '@/features/catalog/ProductCollections';
import { CompareTable } from '@/features/vault/CompareTable';
import { useCatalog } from '@/store/catalog';
import { useVault } from '@/store/vault';

type VaultMode = 'grid' | 'compare';

export default function Vault() {
  useTrayPlacement('dock');
  const ids = useVault((s) => s.ids);
  const byId = useCatalog((s) => s.byId);
  const [mode, setMode] = useState<VaultMode>('grid');
  const products = useMemo(() => ids.map((id) => byId[id]).filter((p) => p !== undefined), [ids, byId]);
  const comparable = products.slice(0, 3);

  return (
    <ScrollShell title="Vault">
      <Container className="gap-6">
        <View className="gap-1">
          <Text className="font-sora-bold text-[30px] text-snow" accessibilityRole="header">
            Vault
          </Text>
          <Text className="font-sora text-sm text-mist">
            {products.length
              ? `${products.length} saved · tap the bookmark on any device to add or remove it`
              : 'Devices you save, kept in one place'}
          </Text>
        </View>

        {products.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title="Your Vault is empty"
            body="Lock in devices you like with the bookmark. Compare them side by side when you’re ready to choose."
          >
            <Button label="Explore devices" trailingIcon="arrow" onPress={() => router.push('/explore')} />
          </EmptyState>
        ) : (
          <>
            {products.length > 1 && (
              <View className="max-w-[360px]">
                <Segmented
                  options={[
                    { value: 'grid', label: 'Saved' },
                    { value: 'compare', label: 'Compare' },
                  ]}
                  value={mode}
                  onChange={setMode}
                />
              </View>
            )}
            {mode === 'compare' && products.length > 1 ? (
              <View>
                <SectionHeader eyebrow="Side by side" title={`Comparing ${comparable.length}`} />
                <CompareTable products={comparable} />
                {products.length > 3 && <Text className="mt-3 font-sora text-xs text-dim">Showing your three most recent saves.</Text>}
              </View>
            ) : (
              <ProductGrid products={products} />
            )}
          </>
        )}
      </Container>
    </ScrollShell>
  );
}
