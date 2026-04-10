import { NextFunction, Request, Response } from 'express';
import { PaymentService, SubscriptionItem } from '../services/payment.service';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async createIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, currency, description, userId } = req.body as {
        amount: number;
        currency: string;
        description?: string;
        userId?: string;
      };

      const authenticatedUserId = req.user?.userId;

      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifie',
        });
      }

      if (userId && userId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Le userId du token ne correspond pas au userId envoye',
        });
      }

      const payload = await this.paymentService.createPaymentIntent(
        amount,
        currency,
        authenticatedUserId,
        description,
        req.user?.email
      );

      return res.status(201).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { subscriptionItems, oneTimeAmountCents, oneTimeDescription, userEmail } = req.body as {
        subscriptionItems: SubscriptionItem[];
        oneTimeAmountCents?: number;
        oneTimeDescription?: string;
        userEmail: string;
      };

      const authenticatedUserId = req.user?.userId;

      if (!authenticatedUserId) {
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

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_EMAIL',
          message: 'L\'email utilisateur est requis pour créer un abonnement Stripe',
        });
      }

      const payload = await this.paymentService.createSubscription(
        subscriptionItems,
        oneTimeAmountCents ?? 0,
        oneTimeDescription,
        authenticatedUserId,
        userEmail
      );

      return res.status(201).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async getIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authenticatedUserId = req.user?.userId;

      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifie',
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
