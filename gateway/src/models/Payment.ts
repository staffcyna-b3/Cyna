import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type OrderStatus = 'pending' | 'success' | 'error';

interface OrderAttributes {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  stripe_payment_intent_id: string;
  created_at?: Date;
  updated_at?: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'created_at' | 'updated_at'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: string;
  declare user_id: string;
  declare total_amount: number;
  declare status: OrderStatus;
  declare stripe_payment_intent_id: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
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
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export default Order;
