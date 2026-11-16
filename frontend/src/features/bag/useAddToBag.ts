import type { Product } from '@kovra/shared';
import { useCallback } from 'react';
import type { HostInstance } from 'react-native';
import { useCart } from '@/store/cart';
import { useDropToTray } from './DropToTray';

interface AddOptions {
  color?: string;
  storage?: string;
}

/** Adds a product to the bag by pulling it from `origin` into the Bag Tray. */
export function useAddToBag() {
  const { drop } = useDropToTray();
  const add = useCart((s) => s.add);

  return useCallback(
    (product: Product, origin: HostInstance | null, { color, storage }: AddOptions = {}) => {
      const colorName = color ?? product.colors[0]?.name;
      const storageLabel = storage ?? product.storage?.[0]?.label;
      const hex = product.colors.find((c) => c.name === colorName)?.hex;
      drop(origin, product, () => add({ productId: product.id, color: colorName, storage: storageLabel }), hex);
    },
    [drop, add],
  );
}
