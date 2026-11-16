import { randomUUID } from 'node:crypto';
import { createReference, quoteSwap, quoteTrade, tradeModels, unitPrice, type TradeRequest } from '@kovra/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import type { AppContext } from '../../context.js';
import type { Db } from '../../db/client.js';
import { products, tradeRequests } from '../../db/schema.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { parse } from '../../lib/validation.js';
import { customerSchema } from '../shared-schemas.js';

const deviceSchema = z.object({
  modelId: z.string().min(1),
  storage: z.string().min(2).max(10),
  grade: z.enum(['flawless', 'good', 'fair', 'cracked']),
  battery: z.enum(['above-90', '80-90', 'below-80']),
  hasBox: z.boolean(),
});

const quoteSchema = z.object({ device: deviceSchema, targetProductId: z.string().optional() });

const requestSchema = z
  .object({
    kind: z.enum(['sell', 'swap']),
    customer: customerSchema,
    device: deviceSchema,
    targetProductId: z.string().optional(),
  })
  .refine((input) => input.kind === 'sell' || Boolean(input.targetProductId), {
    message: 'Choose the device you want to swap into',
    path: ['targetProductId'],
  });

type TradeRow = typeof tradeRequests.$inferSelect;

const toTradeRequest = ({ userId: _u, updatedAt: _t, targetProductId, ...row }: TradeRow): TradeRequest => ({
  ...row,
  ...(targetProductId && { targetProductId }),
});

function quote(db: Db, device: z.infer<typeof deviceSchema>, targetProductId?: string) {
  if (!targetProductId) {
    const result = quoteTrade(device);
    if (!result) throw badRequest('We don’t buy that model yet');
    return result;
  }
  const target = db.select().from(products).where(eq(products.id, targetProductId)).get();
  if (!target) throw notFound('Swap target');
  const result = quoteSwap(device, unitPrice(target));
  if (!result) throw badRequest('We don’t accept that model in a swap yet');
  return result;
}

export function tradeRouter({ db }: AppContext): Router {
  const router = Router();

  router.get('/models', (_req, res) => {
    res.json({ data: tradeModels });
  });

  router.post('/quote', (req, res) => {
    const { device, targetProductId } = parse(quoteSchema, req.body);
    res.json({ data: quote(db, device, targetProductId) });
  });

  router.post('/requests', (req, res) => {
    const input = parse(requestSchema, req.body);
    const now = new Date().toISOString();
    const row = db
      .insert(tradeRequests)
      .values({
        id: randomUUID(),
        reference: createReference(input.kind === 'swap' ? 'SW' : 'SL'),
        userId: res.locals.userId,
        kind: input.kind,
        customer: input.customer,
        device: input.device,
        targetProductId: input.kind === 'swap' ? input.targetProductId : undefined,
        quote: quote(db, input.device, input.kind === 'swap' ? input.targetProductId : undefined),
        status: 'received',
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    res.status(201).json({ data: toTradeRequest(row) });
  });

  router.get('/requests/:id', (req, res) => {
    const row = db.select().from(tradeRequests).where(eq(tradeRequests.id, req.params.id)).get();
    if (!row) throw notFound('Trade request');
    res.json({ data: toTradeRequest(row) });
  });

  return router;
}
