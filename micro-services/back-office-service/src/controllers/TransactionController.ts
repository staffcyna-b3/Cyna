import { Request, Response } from 'express';
import { ITransactionService } from '../interfaces/ITransactionService';

export class TransactionController {
  constructor(private readonly service: ITransactionService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await this.service.getAll(limit);
    res.status(200).json({ success: true, data: result });
  }
}
