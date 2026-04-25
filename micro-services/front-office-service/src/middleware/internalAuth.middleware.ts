import { Request, Response, NextFunction } from 'express';

export function internalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers['x-internal-secret'];
  const expected = process.env.INTERNAL_SECRET;

  if (!expected || secret !== expected) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
}
