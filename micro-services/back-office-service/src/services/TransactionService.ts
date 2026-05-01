import { ITransactionService } from '../interfaces/ITransactionService';
import { TransactionAdminDTO } from '../dto/TransactionAdminDTO';
import { RefundAdminDTO } from '../dto/RefundAdminDTO';
import { IHttpClient } from '../interfaces/IHttpClient';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class TransactionService implements ITransactionService {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(_limit: number = 100): Promise<TransactionAdminDTO[]> {
    // TODO: expose GET /transactions on payments-service to replace this stub
    return [];
  }

  async refund(paymentIntentId: string, amount?: number): Promise<RefundAdminDTO> {
    const body: Record<string, unknown> = { paymentIntentId };
    if (amount !== undefined) body.amount = amount;
    return this.httpClient.post<RefundAdminDTO>(`${PAYMENTS_URL}/refunds`, body);
  }
}
