import { Request, Response, NextFunction } from 'express';
import { isValidUuid } from '../common/validation';

export const requireRoles = (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const role = req.headers['x-user-role'] as string | undefined;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      return;
    }
    const header = req.headers['x-user-id'];
    const userId = Array.isArray(header) ? header[0] : header;
    if (!isValidUuid(userId)) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    res.locals.userId = userId;
    next();
  };
