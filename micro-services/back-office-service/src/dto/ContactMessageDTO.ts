export interface ContactMessageDTO {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'processed';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}
