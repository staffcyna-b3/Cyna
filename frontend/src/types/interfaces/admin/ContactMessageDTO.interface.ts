export interface ContactMessageDTO {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'processed';
  created_at: string;
}
