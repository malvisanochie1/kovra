import { createReference, deliveryFeeFor, findProduct, unitPrice, type CreateOrderInput, type Order, type OrderLine } from '@kovra/shared';
import { isOnline } from '@/config/env';
import { api } from '@/lib/api';

const randomId = () => `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Mirrors the API's pricing so offline orders show exactly what the server would charge. */
function createLocalOrder(input: CreateOrderInput): Order {
  const lines: OrderLine[] = input.lines.flatMap((line) => {
    const product = findProduct(line.productId);
    if (!product) return [];
    return [{ ...line, name: product.name, unitPrice: unitPrice(product, line.storage) }];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFee = deliveryFeeFor(input.fulfilment, input.address?.state, subtotal);
  const now = new Date().toISOString();

  return {
    id: randomId(),
    reference: createReference(),
    status: 'placed',
    ...input,
    lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    createdAt: now,
    updatedAt: now,
  };
}

export async function placeOrder(input: CreateOrderInput, token?: string | null): Promise<Order> {
  if (!isOnline) return createLocalOrder(input);
  return api<Order>('/v1/orders', { method: 'POST', body: input, token });
}

/** Latest status for an order, or `null` if it only exists on this device or the server is unreachable. */
export async function fetchOrder(id: string): Promise<Order | null> {
  if (!isOnline || id.startsWith('local-')) return null;
  try {
    return await api<Order>(`/v1/orders/${id}`);
  } catch {
    return null;
  }
}
