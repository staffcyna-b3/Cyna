import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../common/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.info(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};
