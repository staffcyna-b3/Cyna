import { ISupportRepository } from '../interfaces/ISupportRepository';
import { ISupportService } from '../interfaces/ISupportService';
import { ContactMessageDTO } from '../dto/ContactMessageDTO';
import { MailService } from './mail.service';
import ContactMessage from '../models/ContactMessage';

function toDTO(msg: ContactMessage): ContactMessageDTO {
  return {
    id: msg.id,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    status: msg.status,
    created_at: msg.created_at.toISOString(),
  };
}

export class SupportService implements ISupportService {
  constructor(
    private readonly repo: ISupportRepository,
    private readonly mailService: MailService,
  ) {}

  async getAll(): Promise<ContactMessageDTO[]> {
    const messages = await this.repo.findAll();
    return messages.map(toDTO);
  }

  async getById(id: string): Promise<ContactMessageDTO> {
    const msg = await this.repo.findById(id);
    if (!msg) throw { status: 404, error: 'CONTACT_MESSAGE_NOT_FOUND' };
    return toDTO(msg);
  }

  async markAsProcessed(id: string): Promise<ContactMessageDTO> {
    const msg = await this.repo.updateStatus(id, 'processed');
    return toDTO(msg);
  }

  async reply(id: string, replyMessage: string): Promise<ContactMessageDTO> {
    const msg = await this.repo.findById(id);
    if (!msg) throw { status: 404, error: 'CONTACT_MESSAGE_NOT_FOUND' };

    await this.mailService.sendReply({
      to: msg.email,
      subject: msg.subject,
      replyMessage,
      originalMessage: msg.message,
    });

    const updated = await this.repo.updateStatus(id, 'processed');
    return toDTO(updated);
  }
}
