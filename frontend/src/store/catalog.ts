import { products as bundledProducts, type Product } from '@kovra/shared';
import { create } from 'zustand';
import { fetchProducts } from '@/services/catalog';

interface CatalogState {
  products: Product[];
  byId: Record<string, Product>;
  refresh: () => Promise<void>;
}

const index = (list: Product[]) => Object.fromEntries(list.map((p) => [p.id, p]));

/**
 * Starts with the bundled catalogue so every screen renders instantly, then
 * swaps in live prices and stock from the API in the background.
 */
export const useCatalog = create<CatalogState>()((set) => ({
  products: bundledProducts,
  byId: index(bundledProducts),
  refresh: async () => {
    const live = await fetchProducts();
    if (live) set({ products: live, byId: index(live) });
  },
}));

export const useProduct = (id: string | undefined) => useCatalog((s) => (id ? s.byId[id] : undefined));
