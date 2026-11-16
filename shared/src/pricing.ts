import type { Naira, OrderLineInput, Product, StorageOption } from './types';

/** Unit price for a product with the chosen storage tier applied. */
export function unitPrice(product: { price: Naira; storage?: StorageOption[] | null }, storage?: string): Naira {
  const delta = product.storage?.find((s) => s.label === storage)?.priceDelta ?? 0;
  return product.price + delta;
}

export function subtotalOf(lines: ReadonlyArray<OrderLineInput>, lookup: (id: string) => Product | undefined): Naira {
  return lines.reduce((sum, line) => {
    const product = lookup(line.productId);
    return product ? sum + unitPrice(product, line.storage) * line.quantity : sum;
  }, 0);
}

export function discountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round((1 - product.price / product.compareAtPrice) * 100);
}

/** `₦1,450,000` — formatted by hand so it renders identically on Hermes and the web. */
export const formatNaira = (amount: Naira): string =>
  `₦${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

/** `₦1.45M` / `₦420K` for tight spaces. */
export function formatNairaShort(amount: Naira): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 2).replace(/0$/, '')}M`;
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}K`;
  return formatNaira(amount);
}
