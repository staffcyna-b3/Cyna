import ContactMessage from '../models/ContactMessage';

export interface ISupportRepository {
  create(data: { email: string; subject: string; message: string }): Promise<ContactMessage>;
}
