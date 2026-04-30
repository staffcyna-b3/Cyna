import { ITransactionService } from '../interfaces/ITransactionService';
import { TransactionAdminDTO } from '../dto/TransactionAdminDTO';
import { IHttpClient } from '../interfaces/IHttpClient';

export class TransactionService implements ITransactionService {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(_limit: number = 100): Promise<TransactionAdminDTO[]> {
    // TODO: replace with real call when payments-service exposes GET /api/payments/transactions
    // return this.httpClient.get<TransactionAdminDTO[]>(
    //   `${process.env.MS_PAYMENTS_URL}/transactions?limit=${_limit}`
    // );
    return [];
  }
}
