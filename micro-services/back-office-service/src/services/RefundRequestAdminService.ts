import { IRefundRequestRepository } from '../interfaces/IRefundRequestRepository';
import { RefundRequestStatus } from '../models/RefundRequest';
import type RefundRequest from '../models/RefundRequest';
import { IHttpClient } from '../interfaces/IHttpClient';
import { RefundRequestAdminDTO } from '../dto/RefundRequestAdminDTO';
import { Logger } from '../common/logger';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class RefundRequestAdminService {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly repository: IRefundRequestRepository,
  ) {}

  async getPending(): Promise<RefundRequestAdminDTO[]> {
    const requests = await this.repository.findPending();
    return requests.map((r) => this.toDTO(r));
  }

  async updateStatus(id: number, status: 'approved' | 'rejected'): Promise<RefundRequestAdminDTO> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Demande introuvable' };
    }

    // Update DB first — prevents double-refund if the Stripe call fails later
    await this.repository.updateStatus(id, status as RefundRequestStatus);

    if (status === 'approved') {
      try {
        await this.httpClient.post(`${PAYMENTS_URL}/refunds`, {
          ...(request.stripe_payment_intent_id
            ? { paymentIntentId: request.stripe_payment_intent_id }
            : { subscriptionId: request.stripe_subscription_id }),
        });
      } catch (err) {
        // Stripe failed — revert to pending so the admin can retry
        await this.repository.updateStatus(id, RefundRequestStatus.PENDING);
        Logger.error('[REFUND-REQUEST] Stripe refund failed, status reverted to pending', { id, err });
        throw { status: 502, code: 'STRIPE_ERROR', message: 'Échec du remboursement Stripe' };
      }
    }

    const updated = await this.repository.findById(id);
    return this.toDTO(updated!);
  }

  private toDTO(r: RefundRequest): RefundRequestAdminDTO {
    return {
      id: r.id,
      user_id: r.user_id,
      stripe_subscription_id: r.stripe_subscription_id,
      stripe_payment_intent_id: r.stripe_payment_intent_id,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at.toISOString(),
    };
  }
}