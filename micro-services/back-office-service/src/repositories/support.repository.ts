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
    const [count] = await ContactMessage.update({ status }, { where: { id } });
    if (count === 0) {
      throw Object.assign(new Error('CONTACT_MESSAGE_NOT_FOUND'), { status: 404 });
    }
    return ContactMessage.findByPk(id) as Promise<ContactMessage>;
  }

  async markReplied(id: string, adminReply: string): Promise<ContactMessage> {
    const [count] = await ContactMessage.update(
      {
        status: 'processed',
        admin_reply: adminReply,
        replied_at: new Date(),
      },
      { where: { id } }
    );
    if (count === 0) {
      throw Object.assign(new Error('CONTACT_MESSAGE_NOT_FOUND'), { status: 404 });
    }
    return ContactMessage.findByPk(id) as Promise<ContactMessage>;
  }
}
