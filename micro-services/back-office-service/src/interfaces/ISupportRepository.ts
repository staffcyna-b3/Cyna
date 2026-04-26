import ContactMessage from '../models/ContactMessage';

export interface ISupportRepository {
  findAll(): Promise<ContactMessage[]>;
  findById(id: string): Promise<ContactMessage | null>;
  updateStatus(id: string, status: 'new' | 'processed'): Promise<ContactMessage>;
}
