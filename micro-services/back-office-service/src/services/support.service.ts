import { ISupportRepository } from '../interfaces/ISupportRepository';
import { ISupportService } from '../interfaces/ISupportService';
import { ContactMessageDTO } from '../dto/ContactMessageDTO';
import { IMailService } from '../interfaces/IMailService';
import ContactMessage from '../models/ContactMessage';

function toDTO(msg: ContactMessage): ContactMessageDTO {
  return {
    id: msg.id,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    status: msg.status,
    admin_reply: msg.admin_reply ?? null,
    replied_at: msg.replied_at ? msg.replied_at.toISOString() : null,
    created_at: msg.created_at.toISOString(),
  };
}

export class SupportService implements ISupportService {
  constructor(
    private readonly repo: ISupportRepository,
    private readonly mailService: IMailService,
  ) {}

  async getAll(): Promise<ContactMessageDTO[]> {
    const messages = await this.repo.findAll();
    return messages.map(toDTO);
  }

  async getById(id: string): Promise<ContactMessageDTO> {
    const msg = await this.repo.findById(id);
    if (!msg) throw Object.assign(new Error('CONTACT_MESSAGE_NOT_FOUND'), { status: 404 });
    return toDTO(msg);
  }

  async markAsProcessed(id: string): Promise<ContactMessageDTO> {
    const msg = await this.repo.updateStatus(id, 'processed');
    return toDTO(msg);
  }

  async reply(id: string, replyMessage: string): Promise<ContactMessageDTO> {
    const msg = await this.repo.findById(id);
    if (!msg) throw Object.assign(new Error('CONTACT_MESSAGE_NOT_FOUND'), { status: 404 });

    await this.mailService.sendReply({
      to: msg.email,
      subject: msg.subject,
      replyMessage,
      originalMessage: msg.message,
    });

    const updated = await this.repo.markReplied(id, replyMessage);
    return toDTO(updated);
  }
}
