import { IRefundService } from '../interfaces/IRefundService';
import { RefundAdminDTO } from '../dto/RefundAdminDTO';
import { IHttpClient } from '../interfaces/IHttpClient';

export class RefundService implements IRefundService {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(_limit: number = 100): Promise<RefundAdminDTO[]> {
    const res = await this.httpClient.get<{ data: RefundAdminDTO[] }>(
      `${process.env.MS_PAYMENTS_URL}/refunds?limit=${_limit}`
    );
    return res.data;
  }

  async create(paymentIntentId: string, amount?: number, reason?: string): Promise<RefundAdminDTO> {
    const body: Record<string, unknown> = { paymentIntentId };
    if (amount !== undefined) body.amount = amount;
    if (reason !== undefined) body.reason = reason;

    return this.httpClient.post<RefundAdminDTO>(
      `${process.env.MS_PAYMENTS_URL}/refunds`,
      body
    );
  }
}
