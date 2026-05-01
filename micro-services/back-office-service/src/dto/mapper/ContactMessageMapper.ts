import ContactMessage from '../../models/ContactMessage';
import { ContactMessageDTO } from '../ContactMessageDTO';

export function toContactMessageDTO(msg: ContactMessage): ContactMessageDTO {
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
