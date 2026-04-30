import { TransactionAdminDTO } from '../dto/TransactionAdminDTO';

export interface ITransactionService {
  getAll(limit: number): Promise<TransactionAdminDTO[]>;
}
