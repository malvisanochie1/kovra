import type { Order, TradeRequest } from '@kovra/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

interface HistoryState {
  orders: Order[];
  trades: TradeRequest[];
  saveOrder: (order: Order) => void;
  saveTrade: (trade: TradeRequest) => void;
}

const upsert = <T extends { id: string }>(list: T[], item: T) => [item, ...list.filter((x) => x.id !== item.id)];

/** Orders and trade requests made on this device, newest first. */
export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      orders: [],
      trades: [],
      saveOrder: (order) => set((s) => ({ orders: upsert(s.orders, order) })),
      saveTrade: (trade) => set((s) => ({ trades: upsert(s.trades, trade) })),
    }),
    { name: 'kovra.history', storage: persistStorage, version: 1 },
  ),
);
