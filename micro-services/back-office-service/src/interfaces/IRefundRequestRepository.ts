import { Transaction } from 'sequelize';
import RefundRequest, { RefundRequestStatus } from '../models/RefundRequest';

export interface IRefundRequestRepository {
  findPending(): Promise<RefundRequest[]>;
  findById(id: number): Promise<RefundRequest | null>;
  updateStatus(id: number, status: RefundRequestStatus, options?: { transaction?: Transaction }): Promise<void>;
}