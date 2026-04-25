import Subscription from '../models/Subscription';
import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { IRefundRequestRepository } from '../interfaces/IRefundRequestRepository';
import { Logger } from '../common/logger';
import Product from '../models/Product';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class UserSubscriptionService {
  constructor(private readonly refundRequestRepository: IRefundRequestRepository) {}

  async getByUserId(userId: string): Promise<Subscription[]> {
    return Subscription.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async cancelAtPeriodEnd(stripeSubscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.findAndVerifyOwnership(stripeSubscriptionId, userId);

    const res = await fetch(`${PAYMENTS_URL}/subscriptions/${stripeSubscriptionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw { status: res.status, code: 'STRIPE_ERROR', message: body?.message ?? 'Stripe error' };
    }

    await subscription.update({ cancel_at_period_end: true });

    Logger.info('[USER-SUB] Subscription scheduled for cancellation at period end', {
      stripeSubscriptionId,
      userId,
    });

    return subscription.reload();
  }

  async createRefundRequest(
    stripeSubscriptionId: string,
    userId: string,
    reason: string
  ) {
    await this.findAndVerifyOwnership(stripeSubscriptionId, userId);

    const refundRequest = await this.refundRequestRepository.create({
      userId,
      stripeSubscriptionId,
      reason,
    });

    Logger.info('[USER-SUB] Refund request created', { stripeSubscriptionId, userId });
    return refundRequest;
  }

  private async findAndVerifyOwnership(stripeSubscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: { stripe_subscription_id: stripeSubscriptionId },
    });

    if (!subscription) {
      throw { status: 404, code: 'SUBSCRIPTION_NOT_FOUND', message: 'Abonnement introuvable' };
    }

    if (subscription.user_id !== userId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Accès non autorisé à cet abonnement' };
    }

    return subscription;
  }
}
