import { Request, Response } from 'express';
import { ITransactionService } from '../interfaces/ITransactionService';

export class TransactionController {
  constructor(private readonly service: ITransactionService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await this.service.getAll(limit);
    res.status(200).json({ success: true, data: result });
  }

  async refund(req: Request, res: Response): Promise<void> {
    const { paymentIntentId } = req.params;
    const { amount } = req.body as { amount?: number };

    if (amount !== undefined && amount <= 0) {
      res.status(400).json({ success: false, error: 'INVALID_AMOUNT' });
      return;
    }

    const refund = await this.service.refund(paymentIntentId, amount);
    res.status(201).json({ success: true, data: refund });
  }
}
