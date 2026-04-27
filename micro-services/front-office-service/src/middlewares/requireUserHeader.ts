import { Request, Response, NextFunction } from 'express';
import { isValidUuid } from '../common/validation';

export const requireUserHeader = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers['x-user-id'];
  const userId = Array.isArray(header) ? header[0] : header;
  if (!isValidUuid(userId)) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  res.locals.userId = userId;
  next();
};