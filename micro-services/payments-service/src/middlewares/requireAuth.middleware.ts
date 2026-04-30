import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (!userId || !userEmail) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Utilisateur non authentifié',
    });
  }

  req.user = { userId, email: userEmail };
  next();
};
