import RefundRequest, { RefundRequestStatus } from '../models/RefundRequest';
import { IHttpClient } from '../interfaces/IHttpClient';
import { RefundRequestAdminDTO } from '../dto/RefundRequestAdminDTO';
import User from '../models/User';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class RefundRequestAdminService {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(): Promise<RefundRequestAdminDTO[]> {
    const requests = await RefundRequest.findAll({
      where: { status: RefundRequestStatus.PENDING },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
      order: [['created_at', 'DESC']],
    });
    return requests.map((r) => this.toDTO(r));
  }

  async updateStatus(id: number, status: 'approved' | 'rejected'): Promise<RefundRequestAdminDTO> {
    const request = await RefundRequest.findByPk(id);
    if (!request) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Demande introuvable' };
    }

    if (status === 'approved' && request.stripe_payment_intent_id) {
      await this.httpClient.post(`${PAYMENTS_URL}/refunds`, {
        paymentIntentId: request.stripe_payment_intent_id,
      });
    }

    await request.update({ status });
    return this.toDTO(request);
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
