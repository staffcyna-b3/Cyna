import { Request, Response } from 'express';
import { IPaymentIntentService } from '../interfaces/IPaymentIntentService';
import { IStripeSubscriptionService } from '../interfaces/IStripeSubscriptionService';
import { CreateIntentDTO } from '../interfaces/CreateIntentDTO';
import { CreateSubscriptionDTO } from '../interfaces/CreateSubscriptionDTO';

export class PaymentController {
  constructor(
    private readonly paymentIntentService: IPaymentIntentService,
    private readonly subscriptionService: IStripeSubscriptionService
  ) {}

  async createIntent(req: Request, res: Response): Promise<void> {
    const { amount, currency, description } = req.body as CreateIntentDTO;
    const payload = await this.paymentIntentService.createPaymentIntent(
      amount,
      currency,
      req.user!.userId,
      description,
      req.user!.email
    );
    res.status(201).json(payload);
  }

  async createSubscription(req: Request, res: Response): Promise<void> {
    const { subscriptionItems, oneTimeAmountCents, oneTimeDescription } = req.body as CreateSubscriptionDTO;
    const payload = await this.subscriptionService.createSubscription(
      subscriptionItems,
      oneTimeAmountCents ?? 0,
      oneTimeDescription,
      req.user!.userId,
      req.user!.email
    );
    res.status(201).json(payload);
  }

  async getIntent(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        error: 'INVALID_PAYMENT_INTENT_ID',
        message: 'Identifiant payment intent invalide',
      });
      return;
    }

    const payload = await this.paymentIntentService.retrievePaymentIntent(id, req.user!.userId);
    res.status(200).json(payload);
  }
}
