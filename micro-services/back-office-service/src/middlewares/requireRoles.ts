import { Request, Response, NextFunction } from 'express';

export const requireRoles = (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const role = req.headers['x-user-role'] as string | undefined;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
