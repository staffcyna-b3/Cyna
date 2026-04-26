import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ContactMessageAttributes {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'processed';
  created_at?: Date;
  updated_at?: Date;
}

export interface ContactMessageCreationAttributes
  extends Optional<ContactMessageAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {}

class ContactMessage
  extends Model<ContactMessageAttributes, ContactMessageCreationAttributes>
  implements ContactMessageAttributes {
  declare id: string;
  declare email: string;
  declare subject: string;
  declare message: string;
  declare status: 'new' | 'processed';
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

ContactMessage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('new', 'processed'),
      defaultValue: 'new',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'contact_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ContactMessage;
