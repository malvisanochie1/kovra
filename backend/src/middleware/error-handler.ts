import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError, notFound } from '../lib/errors.js';
import type { Logger } from '../lib/logger.js';

export const notFoundHandler: RequestHandler = (req) => {
  throw notFound(`Route ${req.method} ${req.path}`);
};

export const errorHandler =
  (logger: Logger): ErrorRequestHandler =>
  (error, req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
      return;
    }
    if (error?.type === 'entity.parse.failed') {
      res.status(400).json({ error: { code: 'bad_json', message: 'Request body is not valid JSON' } });
      return;
    }
    logger.error({ err: error, path: req.path }, 'Unhandled error');
    res.status(500).json({ error: { code: 'internal', message: 'Something went wrong on our side' } });
  };
