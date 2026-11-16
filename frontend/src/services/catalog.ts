import type { Product } from '@kovra/shared';
import { isOnline } from '@/config/env';
import { api } from '@/lib/api';

/** Live catalogue from the API, or `null` when offline so callers keep what they have. */
export async function fetchProducts(): Promise<Product[] | null> {
  if (!isOnline) return null;
  try {
    return await api<Product[]>('/v1/products');
  } catch {
    return null;
  }
}
