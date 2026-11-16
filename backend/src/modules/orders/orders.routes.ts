import { nigerianStates } from '@kovra/shared';
import { Router, type Request } from 'express';
import { z } from 'zod';
import type { AppContext } from '../../context.js';
import { requireAdmin, requireUser } from '../../middleware/auth.js';
import { parse } from '../../lib/validation.js';
import { customerSchema } from '../shared-schemas.js';
import { createOrder, getOrder, listOrdersForUser, updateOrderStatus } from './orders.service.js';

const stateNames = nigerianStates.map((s) => s.name) as [string, ...string[]];

const createOrderSchema = z.object({
  customer: customerSchema,
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
        color: z.string().max(40).optional(),
        storage: z.string().max(10).optional(),
      }),
    )
    .min(1, 'Your bag is empty')
    .max(30),
  fulfilment: z.enum(['delivery', 'pickup']),
  address: z
    .object({
      state: z.enum(stateNames),
      city: z.string().trim().min(2).max(60),
      street: z.string().trim().min(4).max(160),
      landmark: z.string().trim().max(120).optional(),
    })
    .optional(),
  payment: z.enum(['transfer', 'pay-on-delivery']),
  note: z.string().trim().max(500).optional(),
});

const statusSchema = z.object({
  status: z.enum(['confirmed', 'packed', 'in-transit', 'delivered', 'cancelled']),
});

export function ordersRouter({ db, env }: AppContext): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const order = createOrder(db, parse(createOrderSchema, req.body), res.locals.userId);
    res.status(201).json({ data: order });
  });

  router.get('/', requireUser, (_req, res) => {
    res.json({ data: listOrdersForUser(db, res.locals.userId!) });
  });

  /** Order IDs are random UUIDs, so possession of the ID is enough to track it. */
  router.get('/:id', (req, res) => {
    res.json({ data: getOrder(db, req.params.id) });
  });

  router.patch('/:id/status', requireAdmin(env), (req: Request<{ id: string }>, res) => {
    const { status } = parse(statusSchema, req.body);
    res.json({ data: updateOrderStatus(db, req.params.id, status) });
  });

  return router;
}
