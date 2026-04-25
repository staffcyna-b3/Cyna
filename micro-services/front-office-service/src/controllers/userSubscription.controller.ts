import { Request, Response } from 'express';
import { UserSubscriptionService } from '../services/userSubscription.service';
import { isValidUuid } from '../common/validation';

export class UserSubscriptionController {
  constructor(private readonly service: UserSubscriptionService) {}

  async getMySubscriptions(req: Request, res: Response): Promise<Response> {
    const userId = this.extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const subscriptions = await this.service.getByUserId(userId);
    return res.status(200).json(subscriptions);
  }

  async cancel(req: Request, res: Response): Promise<Response> {
    const userId = this.extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { stripeSubscriptionId } = req.params;
    const subscription = await this.service.cancelAtPeriodEnd(stripeSubscriptionId, userId);
    return res.status(200).json(subscription);
  }

  async createRefundRequest(req: Request, res: Response): Promise<Response> {
    const userId = this.extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { stripeSubscriptionId } = req.params;
    const { reason } = req.body as { reason?: string };

    if (!reason || reason.trim().length === 0) {
      return res.status(422).json({ message: 'Le motif de la demande est requis' });
    }

    const refundRequest = await this.service.createRefundRequest(stripeSubscriptionId, userId, reason.trim());
    return res.status(201).json(refundRequest);
  }

  private extractUserId(req: Request): string | undefined {
    const header = req.headers['x-user-id'];
    const userId = Array.isArray(header) ? header[0] : header;
    return isValidUuid(userId) ? userId : undefined;
  }
}
