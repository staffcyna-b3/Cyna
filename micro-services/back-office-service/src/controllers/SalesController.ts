import { Request, Response } from 'express';
import { SalesService } from '../services/SalesService';

export class SalesController {
  constructor(private readonly service: SalesService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const sales = await this.service.getAll();
    res.status(200).json({ success: true, data: sales });
  }
}
