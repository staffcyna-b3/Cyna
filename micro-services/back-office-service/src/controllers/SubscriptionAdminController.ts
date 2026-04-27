import { Request, Response } from 'express';
import { SubscriptionAdminService } from '../services/SubscriptionAdminService';

export class SubscriptionAdminController {
  constructor(private readonly service: SubscriptionAdminService) {}

  async getAll(_req: Request, res: Response): Promise<void> {
    const data = await this.service.getAll();
    res.status(200).json({ success: true, data });
  }

  async cancelById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await this.service.cancelById(id);
    if (!result.stripeNotified) {
      res.status(207).json({
        success: true,
        warning: 'STRIPE_NOT_NOTIFIED',
        message: "L'abonnement a été annulé localement mais Stripe n'a pas pu être notifié.",
      });
      return;
    }
    res.status(200).json({ success: true });
  }
}