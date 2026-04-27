import { ISupportRepository } from '../interfaces/ISupportRepository';
import { ISupportService } from '../interfaces/ISupportService';
import { IMailService } from '../interfaces/IMailService';

export class SupportService implements ISupportService {
  constructor(
    private readonly repo: ISupportRepository,
    private readonly mailService: IMailService,
  ) {}

  async submit(data: { email: string; subject: string; message: string }): Promise<void> {
    await this.repo.create(data);

    try {
      await this.mailService.sendContactNotification({
        fromEmail: data.email,
        subject: data.subject,
        message: data.message,
      });
    } catch (error) {
      console.warn('[SupportService] Email non envoyé :', error);
    }
  }
}
