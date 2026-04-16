import { NextFunction, Request, Response } from 'express';
import { PaymentService, SubscriptionItem } from '../services/paymentService';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async createIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, currency, description } = req.body as {
        amount: number;
        currency: string;
        description?: string;
      };

      const authenticatedUserId = req.headers['x-user-id'] as string;
      const authenticatedUserEmail = req.headers['x-user-email'] as string;

      if (!authenticatedUserId || !authenticatedUserEmail) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      const payload = await this.paymentService.createPaymentIntent(
        amount,
        currency,
        authenticatedUserId,
        description,
        authenticatedUserEmail
      );

      return res.status(201).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { subscriptionItems, oneTimeAmountCents, oneTimeDescription } = req.body as {
        subscriptionItems: SubscriptionItem[];
        oneTimeAmountCents?: number;
        oneTimeDescription?: string;
      };

      const authenticatedUserId = req.headers['x-user-id'] as string;
      const authenticatedUserEmail = req.headers['x-user-email'] as string;

      if (!authenticatedUserId || !authenticatedUserEmail) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      if (!Array.isArray(subscriptionItems) || subscriptionItems.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_SUBSCRIPTION_ITEMS',
          message: 'Au moins un item d\'abonnement est requis',
        });
      }

      const payload = await this.paymentService.createSubscription(
        subscriptionItems,
        oneTimeAmountCents ?? 0,
        oneTimeDescription,
        authenticatedUserId,
        authenticatedUserEmail
      );

      return res.status(201).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async getIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authenticatedUserId = req.headers['x-user-id'] as string;

      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PAYMENT_INTENT_ID',
          message: 'Identifiant payment intent invalide',
        });
      }

      const payload = await this.paymentService.retrievePaymentIntent(id, authenticatedUserId);
      return res.status(200).json(payload);
    } catch (error) {
      return next(error);
    }
  }
}
