import { ContactMessageDTO } from '../dto/ContactMessageDTO';

export interface ISupportService {
  getAll(): Promise<ContactMessageDTO[]>;
  getById(id: string): Promise<ContactMessageDTO>;
  markAsProcessed(id: string): Promise<ContactMessageDTO>;
  reply(id: string, replyMessage: string): Promise<ContactMessageDTO>;
}
