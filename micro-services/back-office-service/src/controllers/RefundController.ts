import { Request, Response } from 'express';
import { IRefundService } from '../interfaces/IRefundService';
import { CreateRefundRequest } from '../dto/CreateRefundRequest';

export class RefundController {
  constructor(private readonly service: IRefundService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await this.service.getAll(limit);
    res.status(200).json({ success: true, data: result });
  }

  async create(req: Request, res: Response): Promise<void> {
    const { payment_intent_id, amount, reason } = req.body as CreateRefundRequest;

    if (!payment_intent_id) {
      res.status(400).json({ success: false, error: 'MISSING_PAYMENT_INTENT_ID' });
      return;
    }

    if (amount !== undefined && amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'Amount must be greater than 0',
      });
      return;
    }

    const refund = await this.service.create(payment_intent_id, amount, reason);
    res.status(201).json({ success: true, data: refund });
  }
}
