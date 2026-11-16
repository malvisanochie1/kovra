import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { AppContext } from './context.js';
import { identify } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { catalogRouter } from './modules/catalog/catalog.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { tradeRouter } from './modules/trade/trade.routes.js';

export function createApp(ctx: AppContext): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: ctx.env.CORS_ORIGINS }));
  app.use(express.json({ limit: '50kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const v1 = express.Router();
  v1.use(identify(ctx.env));
  v1.use(catalogRouter(ctx));
  v1.use('/auth', authRouter(ctx));
  v1.use('/orders', ordersRouter(ctx));
  v1.use('/trade', tradeRouter(ctx));
  app.use('/v1', v1);

  app.use(notFoundHandler);
  app.use(errorHandler(ctx.logger));

  return app;
}
