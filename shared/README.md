# @kovra/shared

Business rules used by both the app and the API. It is plain TypeScript with no dependencies.

| File          | Contents                                                             |
| ------------- | -------------------------------------------------------------------- |
| `types.ts`    | Domain contracts: products, orders, trade requests                   |
| `catalog.ts`  | Seed catalogue and categories                                        |
| `pricing.ts`  | Unit prices with storage tiers, subtotals, Naira formatting          |
| `delivery.ts` | The 36 states and FCT, delivery zones, fees, free-delivery threshold |
| `trade.ts`    | Trade-in models and the sell and swap quoting formula                |
| `business.ts` | Store contact details, order status flow, order references           |

Money is always an integer number of Naira.
