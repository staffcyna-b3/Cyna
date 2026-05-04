import { Request, Response, NextFunction } from 'express';
import { Logger } from '../common/logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const status: number = err.status || err.statusCode || 500;
  const error: string = err.error || err.message || 'INTERNAL_SERVER_ERROR';
  const message: string | undefined = typeof err.message === 'string' ? err.message : undefined;

  if (status >= 500) {
    Logger.error('Unhandled error', { status, error, stack: err.stack });
  }

  res.status(status).json({ success: false, error, ...(message && message !== error && { message }) });
}
