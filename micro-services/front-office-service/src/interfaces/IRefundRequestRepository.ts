import { RefundRequestStatus } from '../models/RefundRequest';
import RefundRequest from '../models/RefundRequest';

export interface IRefundRequestRepository {
  create(data: {
    userId: string;
    stripeSubscriptionId: string;
    stripePaymentIntentId?: string | null;
    reason: string;
  }): Promise<RefundRequest>;
  findPendingByUserId(userId: string): Promise<RefundRequest[]>;
  findActiveByUserId(userId: string): Promise<RefundRequest[]>;
}
