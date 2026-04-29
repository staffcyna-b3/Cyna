import { Request, Response } from 'express';
import { UserSubscriptionService } from '../services/userSubscription.service';

export class UserSubscriptionController {
  constructor(private readonly service: UserSubscriptionService) {}

  async getMySubscriptions(_req: Request, res: Response): Promise<Response> {
    const userId = res.locals.userId as string;
    const subscriptions = await this.service.getByUserId(userId);
    return res.status(200).json(subscriptions);
  }

  async getMyRefundRequests(_req: Request, res: Response): Promise<Response> {
    const userId = res.locals.userId as string;
    const requests = await this.service.getMyRefundRequests(userId);
    return res.status(200).json(requests);
  }

  async cancel(req: Request, res: Response): Promise<Response> {
    const userId = res.locals.userId as string;
    const stripeSubscriptionId = req.params.stripeSubscriptionId as string;
    const subscription = await this.service.cancelAtPeriodEnd(stripeSubscriptionId, userId);
    return res.status(200).json(subscription);
  }

  async reactivate(req: Request, res: Response): Promise<Response> {
    const userId = res.locals.userId as string;
    const stripeSubscriptionId = req.params.stripeSubscriptionId as string;
    const subscription = await this.service.reactivate(stripeSubscriptionId, userId);
    return res.status(200).json(subscription);
  }

  async createRefundRequest(req: Request, res: Response): Promise<Response> {
    const userId = res.locals.userId as string;
    const stripeSubscriptionId = req.params.stripeSubscriptionId as string;
    const { reason } = req.body as { reason?: string };

    if (!reason || reason.trim().length === 0) {
      return res.status(422).json({ message: 'Le motif de la demande est requis' });
    }

    if (reason.trim().length > 2000) {
      return res.status(422).json({ message: 'Le motif ne peut pas dépasser 2000 caractères' });
    }

    const refundRequest = await this.service.createRefundRequest(stripeSubscriptionId, userId, reason.trim());
    return res.status(201).json(refundRequest);
  }
}