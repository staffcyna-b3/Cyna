import { Transaction } from 'sequelize';
import RefundRequest, { RefundRequestStatus } from '../models/RefundRequest';
import User from '../models/User';
import { IRefundRequestRepository } from '../interfaces/IRefundRequestRepository';

export class RefundRequestRepository implements IRefundRequestRepository {
  async findPending(): Promise<RefundRequest[]> {
    return RefundRequest.findAll({
      where: { status: RefundRequestStatus.PENDING },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: number): Promise<RefundRequest | null> {
    return RefundRequest.findByPk(id);
  }

  async updateStatus(id: number, status: RefundRequestStatus, options?: { transaction?: Transaction }): Promise<void> {
    await RefundRequest.update({ status }, { where: { id }, transaction: options?.transaction });
  }
}