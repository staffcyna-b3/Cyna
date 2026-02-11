import { Request, Response, NextFunction } from 'express';
import { Logger } from '../common/logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.error(`[ERROR] ${err.message}`, err);

  const status = err.status || 500;
  const message = err.message || 'Erreur serveur';

  res.status(status).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
