import ContactMessage from '../models/ContactMessage';
import { ISupportRepository } from '../interfaces/ISupportRepository';

export class SupportRepository implements ISupportRepository {
  async create(data: { email: string; subject: string; message: string }): Promise<ContactMessage> {
    return ContactMessage.create(data);
  }
}
