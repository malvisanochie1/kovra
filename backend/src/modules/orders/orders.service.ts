import { randomUUID } from 'node:crypto';
import {
  createReference,
  deliveryFeeFor,
  orderStatusFlow,
  unitPrice,
  type CreateOrderInput,
  type Order,
  type OrderLine,
  type OrderStatus,
} from '@kovra/shared';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { orders, products } from '../../db/schema.js';
import { badRequest, conflict, notFound } from '../../lib/errors.js';

type OrderRow = typeof orders.$inferSelect;

const toOrder = ({ userId: _u, address, note, ...row }: OrderRow): Order => ({
  ...row,
  ...(address && { address }),
  ...(note && { note }),
});

/**
 * Creates an order inside one transaction: prices come from the database (never the
 * client), stock is reserved atomically and the totals are computed server-side.
 */
export function createOrder(db: Db, input: CreateOrderInput, userId?: string): Order {
  if (input.fulfilment === 'delivery' && !input.address) throw badRequest('A delivery address is required');

  return db.transaction((tx) => {
    const lines: OrderLine[] = input.lines.map((line) => {
      const product = tx.select().from(products).where(eq(products.id, line.productId)).get();
      if (!product) throw notFound(`Product ${line.productId}`);
      if (line.storage && !product.storage?.some((s) => s.label === line.storage)) {
        throw badRequest(`${product.name} is not available in ${line.storage}`);
      }

      const reserved = tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${line.quantity}` })
        .where(and(eq(products.id, product.id), gte(products.stock, line.quantity)))
        .run();
      if (reserved.changes === 0) throw conflict(`Only ${product.stock} of ${product.name} left in stock`);

      return {
        productId: product.id,
        name: product.name,
        quantity: line.quantity,
        unitPrice: unitPrice(product, line.storage),
        ...(line.color && { color: line.color }),
        ...(line.storage && { storage: line.storage }),
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const deliveryFee = deliveryFeeFor(input.fulfilment, input.address?.state, subtotal);
    const now = new Date().toISOString();

    const row = tx
      .insert(orders)
      .values({
        id: randomUUID(),
        reference: createReference(),
        userId,
        status: 'placed',
        customer: input.customer,
        lines,
        fulfilment: input.fulfilment,
        address: input.fulfilment === 'delivery' ? input.address : undefined,
        payment: input.payment,
        note: input.note,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return toOrder(row);
  });
}

export function getOrder(db: Db, id: string): Order {
  const row = db.select().from(orders).where(eq(orders.id, id)).get();
  if (!row) throw notFound('Order');
  return toOrder(row);
}

export function listOrdersForUser(db: Db, userId: string): Order[] {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).all().map(toOrder);
}

/** Store-owner action. Statuses only move forward, except cancelling before dispatch. */
export function updateOrderStatus(db: Db, id: string, next: OrderStatus): Order {
  const current = getOrder(db, id);
  const from = orderStatusFlow.indexOf(current.status as (typeof orderStatusFlow)[number]);

  if (next === 'cancelled') {
    if (current.status === 'in-transit' || current.status === 'delivered') {
      throw conflict('Orders already dispatched cannot be cancelled');
    }
  } else if (current.status === 'cancelled' || orderStatusFlow.indexOf(next) <= from) {
    throw conflict(`Cannot move an order from "${current.status}" to "${next}"`);
  }

  const row = db.update(orders).set({ status: next, updatedAt: new Date().toISOString() }).where(eq(orders.id, id)).returning().get();
  return toOrder(row!);
}
