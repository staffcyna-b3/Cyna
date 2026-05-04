import RefundRequest, { RefundRequestStatus } from '../models/RefundRequest';
import { IRefundRequestRepository } from '../interfaces/IRefundRequestRepository';

export class RefundRequestRepository implements IRefundRequestRepository {
  async create(data: {
    userId: string;
    stripeSubscriptionId: string;
    stripePaymentIntentId?: string | null;
    reason: string;
  }): Promise<RefundRequest> {
    return RefundRequest.create({
      user_id: data.userId,
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_payment_intent_id: data.stripePaymentIntentId ?? null,
      reason: data.reason,
      status: RefundRequestStatus.PENDING,
    });
  }

  async findPendingByUserId(userId: string): Promise<RefundRequest[]> {
    return RefundRequest.findAll({
      where: { user_id: userId, status: RefundRequestStatus.PENDING },
      order: [['created_at', 'DESC']],
    });
  }

  async findActiveByUserId(userId: string): Promise<RefundRequest[]> {
    return RefundRequest.findAll({
      where: { user_id: userId, status: [RefundRequestStatus.PENDING, RefundRequestStatus.APPROVED] },
      order: [['created_at', 'DESC']],
    });
  }
}
