import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { Logger } from '../common/logger';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    Logger.error(`[ERROR] ${err.message}`, { code: err.code, status: err.status, path: req.path });
    return res.status(err.status).json({
      success: false,
      error: err.code,
      message: err.message,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  Logger.error('[ERROR] Unexpected error', err);
  return res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Une erreur interne est survenue',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
