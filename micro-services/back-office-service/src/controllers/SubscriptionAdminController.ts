import { Request, Response } from 'express';
import { SubscriptionAdminService } from '../services/SubscriptionAdminService';

export class SubscriptionAdminController {
  constructor(private readonly service: SubscriptionAdminService) {}

  async getAll(_req: Request, res: Response): Promise<void> {
    const data = await this.service.getAll();
    res.status(200).json({ success: true, data });
  }

  async cancelById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    await this.service.cancelById(id);
    res.status(200).json({ success: true });
  }
}
