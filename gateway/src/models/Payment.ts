import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

interface PaymentAttributes {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: string;
  created_at: Date;
}

type PaymentCreationAttributes = Optional<PaymentAttributes, 'id' | 'created_at'>;

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare id: string;
  declare user_id: string;
  declare amount: number;
  declare currency: string;
  declare stripe_payment_intent_id: string;
  declare status: string;
  declare readonly created_at: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: false,
    underscored: true,
  }
);

export default Payment;
