import { Request, Response } from 'express';
import { SubscriptionAdminService } from '../services/SubscriptionAdminService';

export class SubscriptionAdminController {
  constructor(private readonly service: SubscriptionAdminService) {}

  async cancelNow(req: Request, res: Response): Promise<void> {
    const { stripeSubscriptionId } = req.params;
    const result = await this.service.cancelNow(stripeSubscriptionId);
    res.status(200).json({ success: true, data: result });
  }
}
