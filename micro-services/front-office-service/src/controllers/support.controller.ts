import { Request, Response } from 'express';
import { ISupportService } from '../interfaces/ISupportService';

export class SupportController {
  constructor(private readonly service: ISupportService) {}

  async submit(req: Request, res: Response): Promise<void> {
    const { email, subject, message } = req.body;
    await this.service.submit({ email, subject, message });
    res.status(201).json({ success: true });
  }
}
