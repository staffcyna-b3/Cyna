import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { PaymentAttributes } from '../interfaces/PaymentAttributes.interface';
import { OrderStatus } from '../enum/OrderStatus.enum';
import { PaymentType } from '../enum/PaymentType.enum';

type PaymentCreationAttributes = Optional<PaymentAttributes, 'id' | 'created_at' | 'updated_at' | 'payment_type'>;

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare id: string;
  declare user_id: string;
  declare total_amount: number;
  declare currency: string;
  declare status: OrderStatus;
  declare stripe_payment_intent_id: string;
  declare payment_type: PaymentType;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
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
      references: { model: 'users', key: 'id' },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'error'),
      allowNull: false,
      defaultValue: 'pending',
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    payment_type: {
      type: DataTypes.ENUM('one_time', 'subscription'),
      allowNull: false,
      defaultValue: 'one_time',
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export default Payment;
// Re-exported for consumers (e.g. order.repository.ts)
export { OrderStatus, PaymentType };
