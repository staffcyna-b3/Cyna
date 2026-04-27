import { Request, Response } from 'express';
import { RefundRequestAdminService } from '../services/RefundRequestAdminService';

export class RefundRequestAdminController {
  constructor(private readonly service: RefundRequestAdminService) {}

  async getAll(_req: Request, res: Response): Promise<void> {
    const data = await this.service.getPending();
    res.status(200).json({ success: true, data });
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body as { status?: 'approved' | 'rejected' };

    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, error: 'INVALID_STATUS' });
      return;
    }

    const result = await this.service.updateStatus(id, status);
    res.status(200).json({ success: true, data: result });
  }
}