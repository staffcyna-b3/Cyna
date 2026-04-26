import ContactMessage from '../models/ContactMessage';
import { ISupportRepository } from '../interfaces/ISupportRepository';

export class SupportRepository implements ISupportRepository {
  async findAll(): Promise<ContactMessage[]> {
    return ContactMessage.findAll({ order: [['created_at', 'DESC']] });
  }

  async findById(id: string): Promise<ContactMessage | null> {
    return ContactMessage.findByPk(id);
  }

  async updateStatus(id: string, status: 'new' | 'processed'): Promise<ContactMessage> {
    const msg = await ContactMessage.findByPk(id);
    if (!msg) throw { status: 404, error: 'CONTACT_MESSAGE_NOT_FOUND' };
    return msg.update({ status });
  }
}
