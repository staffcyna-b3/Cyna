import RefundRequest, { RefundRequestStatus } from '../models/RefundRequest';

export interface IRefundRequestRepository {
  findPending(): Promise<RefundRequest[]>;
  findById(id: number): Promise<RefundRequest | null>;
  updateStatus(id: number, status: RefundRequestStatus): Promise<void>;
}