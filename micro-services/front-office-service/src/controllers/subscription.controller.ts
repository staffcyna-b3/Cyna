import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionBody } from '../interfaces/CreateSubscriptionBody';
import { UpdateStatusBody } from '../interfaces/UpdateStatusBody';

export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // POST /subscriptions
  async create(req: Request, res: Response): Promise<Response> {
    const { stripeSubscriptionId, userId, items, startDate, endDate } =
      req.body as CreateSubscriptionBody;

    if (!stripeSubscriptionId || !userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BODY',
        message: 'stripeSubscriptionId, userId et items sont requis',
      });
    }

    try {
      const count = await this.subscriptionService.create({
        stripeSubscriptionId,
        userId,
        items,
        startDate,
        endDate,
      });
      return res.status(201).json({ created: count });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        error: error.code ?? 'INTERNAL_ERROR',
        message: error.message,
      });
    }
  }

  // PATCH /subscriptions/status
  async updateStatus(req: Request, res: Response): Promise<Response> {
    const { stripeSubscriptionId, status } = req.body as UpdateStatusBody;

    if (!stripeSubscriptionId || !status) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BODY',
        message: 'stripeSubscriptionId et status sont requis',
      });
    }

    try {
      const updatedCount = await this.subscriptionService.updateStatus(stripeSubscriptionId, status);
      return res.status(200).json({ updated: updatedCount });
    } catch (error: any) {
      return res.status(error.status ?? 500).json({
        success: false,
        error: error.code ?? 'INTERNAL_ERROR',
        message: error.message,
      });
    }
  }
}
