import { Optional } from 'sequelize';

export interface ContactMessageAttributes {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'processed';
  admin_reply?: string | null;
  replied_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ContactMessageCreationAttributes
  extends Optional<ContactMessageAttributes, 'id' | 'status' | 'admin_reply' | 'replied_at' | 'created_at' | 'updated_at'> {}
