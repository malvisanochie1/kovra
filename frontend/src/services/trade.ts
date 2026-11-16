import { createReference, quoteSwap, quoteTrade, type CreateTradeInput, type TradeRequest } from '@kovra/shared';
import { isOnline } from '@/config/env';
import { api } from '@/lib/api';

/**
 * Quotes are computed on the device with the same rules the API uses, so they are
 * instant. The server recalculates on submission and is always the source of truth.
 */
export function quoteFor(input: Pick<CreateTradeInput, 'device'> & { targetPrice?: number }) {
  return input.targetPrice === undefined ? quoteTrade(input.device) : quoteSwap(input.device, input.targetPrice);
}

export async function submitTrade(input: CreateTradeInput, targetPrice: number | undefined, token?: string | null): Promise<TradeRequest> {
  if (isOnline) return api<TradeRequest>('/v1/trade/requests', { method: 'POST', body: input, token });

  const quote = quoteFor({ device: input.device, targetPrice });
  if (!quote) throw new Error('We don’t accept that model yet');
  return {
    ...input,
    id: `local-${Date.now().toString(36)}`,
    reference: createReference(input.kind === 'swap' ? 'SW' : 'SL'),
    quote,
    status: 'received',
    createdAt: new Date().toISOString(),
  };
}
