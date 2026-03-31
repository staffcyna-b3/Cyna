import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { Logger } from '../common/logger';
import { CreateSubscriptionBody } from '../interfaces/CreateSubscriptionBody';
import { UpdateStatusBody } from '../interfaces/UpdateStatusBody';

export class SubscriptionController {
  // POST /subscriptions
  // Called by the gateway when a Stripe subscription is created
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

    const created = await Promise.all(
      items.map((item) =>
        Subscription.create({
          user_id: userId,
          product_id: item.productId,
          stripe_subscription_id: stripeSubscriptionId,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          status: SubscriptionStatus.ACTIVE,
          price: item.price,
        })
      )
    );

    Logger.info('[SUBSCRIPTION] Subscriptions created from Stripe', {
      stripeSubscriptionId,
      userId,
      count: created.length,
    });

    return res.status(201).json({ created: created.length });
  }

  // PATCH /subscriptions/status
  // Called by the gateway on invoice.payment_succeeded / payment_failed / subscription.deleted
  async updateStatus(req: Request, res: Response): Promise<Response> {
    const { stripeSubscriptionId, status } = req.body as UpdateStatusBody;

    if (!stripeSubscriptionId || !status) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BODY',
        message: 'stripeSubscriptionId et status sont requis',
      });
    }

    const validStatuses = Object.values(SubscriptionStatus) as string[];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status invalide. Valeurs acceptées : ${validStatuses.join(', ')}`,
      });
    }

    const [updatedCount] = await Subscription.update(
      { status: status as SubscriptionStatus },
      { where: { stripe_subscription_id: stripeSubscriptionId } }
    );

    Logger.info('[SUBSCRIPTION] Status updated from Stripe event', {
      stripeSubscriptionId,
      status,
      updatedCount,
    });

    return res.status(200).json({ updated: updatedCount });
  }
}
