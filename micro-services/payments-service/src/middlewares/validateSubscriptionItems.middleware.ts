import { Request, Response, NextFunction } from 'express';

export const validateSubscriptionItems = (req: Request, res: Response, next: NextFunction) => {
  const { subscriptionItems } = req.body;

  if (!Array.isArray(subscriptionItems) || subscriptionItems.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_SUBSCRIPTION_ITEMS',
      message: "Au moins un item d'abonnement est requis",
    });
  }

  next();
};
