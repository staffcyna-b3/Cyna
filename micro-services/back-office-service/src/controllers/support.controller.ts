import { Request, Response } from 'express';
import { ISupportService } from '../interfaces/ISupportService';
import { ReplyContactMessageRequest } from '../dto/ReplyContactMessageRequest';

export class SupportController {
  constructor(private readonly service: ISupportService) {}

  async getAll(_req: Request, res: Response): Promise<void> {
    const messages = await this.service.getAll();
    res.status(200).json({ success: true, data: messages });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const message = await this.service.getById(id);
    res.status(200).json({ success: true, data: message });
  }

  async markAsProcessed(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const message = await this.service.markAsProcessed(id);
    res.status(200).json({ success: true, data: message });
  }

  async reply(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { replyMessage } = req.body as ReplyContactMessageRequest;

    if (!replyMessage?.trim()) {
      res.status(400).json({ success: false, error: 'MISSING_REPLY_MESSAGE' });
      return;
    }

    const message = await this.service.reply(id, replyMessage.trim());
    res.status(200).json({ success: true, data: message });
  }
}
