import Subscription from '../models/Subscription';
import { ISubscriptionRepository } from '../interfaces/ISubscriptionRepository';
import { IRefundRequestRepository } from '../interfaces/IRefundRequestRepository';
import { Logger } from '../common/logger';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class UserSubscriptionService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly refundRequestRepository: IRefundRequestRepository,
  ) {}

  async getByUserId(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async cancelAtPeriodEnd(stripeSubscriptionId: string, userId: string): Promise<Subscription> {
    if (!stripeSubscriptionId || stripeSubscriptionId.trim().length === 0) {
      throw { status: 400, code: 'INVALID_PARAM', message: 'stripeSubscriptionId manquant' };
    }
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

  async reactivate(stripeSubscriptionId: string, userId: string): Promise<Subscription> {
    if (!stripeSubscriptionId || stripeSubscriptionId.trim().length === 0) {
      throw { status: 400, code: 'INVALID_PARAM', message: 'stripeSubscriptionId manquant' };
    }
    const subscription = await this.findAndVerifyOwnership(stripeSubscriptionId, userId);

    const res = await fetch(`${PAYMENTS_URL}/subscriptions/${stripeSubscriptionId}/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw { status: res.status, code: 'STRIPE_ERROR', message: body?.message ?? 'Stripe error' };
    }

    await subscription.update({ cancel_at_period_end: false });

    Logger.info('[USER-SUB] Subscription reactivated', { stripeSubscriptionId, userId });

    return subscription.reload();
  }

  async getMyRefundRequests(userId: string) {
    return this.refundRequestRepository.findActiveByUserId(userId);
  }

  async createRefundRequest(
    stripeSubscriptionId: string,
    userId: string,
    reason: string | undefined,
  ) {
    if (!stripeSubscriptionId || stripeSubscriptionId.trim().length === 0) {
      throw { status: 400, code: 'INVALID_PARAM', message: 'stripeSubscriptionId manquant' };
    }
    if (!reason || reason.trim().length === 0) {
      throw { status: 400, code: 'INVALID_PARAM', message: 'Le motif de la demande est requis' };
    }
    if (reason.trim().length > 2000) {
      throw { status: 400, code: 'INVALID_PARAM', message: 'Le motif ne peut pas dépasser 2000 caractères' };
    }

    await this.findAndVerifyOwnership(stripeSubscriptionId, userId);

    const refundRequest = await this.refundRequestRepository.create({
      userId,
      stripeSubscriptionId,
      reason: reason.trim(),
    });

    Logger.info('[USER-SUB] Refund request created', { stripeSubscriptionId, userId });
    return refundRequest;
  }

  private async findAndVerifyOwnership(stripeSubscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByStripeId(stripeSubscriptionId);

    if (!subscription) {
      throw { status: 404, code: 'SUBSCRIPTION_NOT_FOUND', message: 'Abonnement introuvable' };
    }

    if (subscription.user_id !== userId) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Accès non autorisé à cet abonnement' };
    }

    return subscription;
  }
}