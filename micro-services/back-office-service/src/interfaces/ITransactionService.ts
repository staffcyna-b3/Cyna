import { TransactionAdminDTO } from '../dto/TransactionAdminDTO';
import { RefundAdminDTO } from '../dto/RefundAdminDTO';

export interface ITransactionService {
  getAll(limit: number): Promise<TransactionAdminDTO[]>;
  refund(paymentIntentId: string, amount?: number): Promise<RefundAdminDTO>;
}
