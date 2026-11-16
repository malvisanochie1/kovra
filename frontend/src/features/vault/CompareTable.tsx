import { conditionLabels, formatNaira, type Product } from '@kovra/shared';
import { ScrollView, Text, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { ProductVisual } from '@/features/catalog/ProductVisual';

const LABEL_WIDTH = 104;
const COLUMN_WIDTH = 150;

/** Side-by-side spec comparison of up to three vaulted devices. */
export function CompareTable({ products }: { products: Product[] }) {
  const specLabels = [...new Set(products.flatMap((p) => p.specs.map((s) => s.label)))];
  const rows: { label: string; values: string[] }[] = [
    { label: 'Price', values: products.map((p) => formatNaira(p.price)) },
    { label: 'Condition', values: products.map((p) => conditionLabels[p.condition]) },
    { label: 'Rating', values: products.map((p) => `${p.rating.toFixed(1)} / 5`) },
    ...specLabels.map((label) => ({ label, values: products.map((p) => p.specs.find((s) => s.label === label)?.value ?? '—') })),
  ];

  return (
    <Reveal index={0} className="overflow-hidden rounded-[24px] border border-edge bg-ink-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row border-b border-edge">
            <View style={{ width: LABEL_WIDTH }} />
            {products.map((p) => (
              <View key={p.id} style={{ width: COLUMN_WIDTH }} className="items-center gap-2 px-3 py-4">
                <ProductVisual product={p} height={84} />
                <Text numberOfLines={2} className="text-center font-sora-semibold text-[13px] text-snow">
                  {p.name}
                </Text>
              </View>
            ))}
          </View>
          {rows.map((row, i) => (
            <View key={row.label} className={`flex-row ${i % 2 === 0 ? 'bg-white/[0.03]' : ''}`}>
              <View style={{ width: LABEL_WIDTH }} className="justify-center px-4 py-3">
                <Text className="font-sora text-[11px] uppercase tracking-[1px] text-dim">{row.label}</Text>
              </View>
              {row.values.map((value, j) => (
                <View key={j} style={{ width: COLUMN_WIDTH }} className="justify-center px-3 py-3">
                  <Text className={`font-sora text-[13px] ${row.label === 'Price' ? 'font-sora-semibold text-gold' : 'text-snow'}`}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </Reveal>
  );
}
