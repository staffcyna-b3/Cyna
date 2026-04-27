import { Request, Response } from 'express';
import { ISupportService } from '../interfaces/ISupportService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SupportController {
  constructor(private readonly service: ISupportService) {}

  async submit(req: Request, res: Response): Promise<void> {
    const { email, subject, message } = req.body;

    if (!email?.trim()) {
      res.status(400).json({ success: false, error: 'MISSING_EMAIL' });
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, error: 'INVALID_EMAIL_FORMAT' });
      return;
    }
    if (!subject?.trim()) {
      res.status(400).json({ success: false, error: 'MISSING_SUBJECT' });
      return;
    }
    if (!message?.trim()) {
      res.status(400).json({ success: false, error: 'MISSING_MESSAGE' });
      return;
    }

    await this.service.submit({
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    res.status(201).json({ success: true });
  }
}
