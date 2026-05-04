import { RefundAdminDTO } from '../dto/RefundAdminDTO';

export interface IRefundService {
  getAll(limit: number): Promise<RefundAdminDTO[]>;
  create(paymentIntentId: string, amount?: number, reason?: string): Promise<RefundAdminDTO>;
}
