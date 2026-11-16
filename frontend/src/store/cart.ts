import { unitPrice } from '@kovra/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';
import { useCatalog } from './catalog';

export interface CartLine {
  key: string;
  productId: string;
  quantity: number;
  color?: string;
  storage?: string;
}

type AddInput = Omit<CartLine, 'key' | 'quantity'> & { quantity?: number };

interface CartState {
  lines: CartLine[];
  add: (input: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const MAX_QUANTITY = 10;

const lineKey = ({ productId, color, storage }: AddInput) => [productId, color ?? '', storage ?? ''].join('|');

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (input) =>
        set((state) => {
          const key = lineKey(input);
          const quantity = input.quantity ?? 1;
          const existing = state.lines.find((line) => line.key === key);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.key === key ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) } : line,
              ),
            };
          }
          return { lines: [...state.lines, { ...input, key, quantity }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.key === key ? { ...line, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) } : line,
          ),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((line) => line.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'kovra.cart', storage: persistStorage, version: 1 },
  ),
);

export const useCartCount = () => useCart((s) => s.lines.reduce((sum, line) => sum + line.quantity, 0));

export function useCartSubtotal(): number {
  const lines = useCart((s) => s.lines);
  const byId = useCatalog((s) => s.byId);
  return lines.reduce((sum, line) => {
    const product = byId[line.productId];
    return product ? sum + unitPrice(product, line.storage) * line.quantity : sum;
  }, 0);
}
