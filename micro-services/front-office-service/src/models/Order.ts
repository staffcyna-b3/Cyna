import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OrderStatus } from '../enum/OrderStatus';

interface OrderAttributes {
  id: string;
  user_id: string;
  billing_address_id: string;
  shipping_address_id: string;
  billing_address_snapshot: object;
  shipping_address_snapshot: object;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  promo_code: string | null;
  status: OrderStatus;
  stripe_payment_intent_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'stripe_payment_intent_id' | 'shipping_fee' | 'discount_amount' | 'promo_code'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: string;
  declare user_id: string;
  declare billing_address_id: string;
  declare shipping_address_id: string;
  declare billing_address_snapshot: object;
  declare shipping_address_snapshot: object;
  declare total_amount: number;
  declare shipping_fee: number;
  declare discount_amount: number;
  declare promo_code: string | null;
  declare status: OrderStatus;
  declare stripe_payment_intent_id?: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Order.init(
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
    billing_address_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shipping_address_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    billing_address_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    shipping_address_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    promo_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

export default Order;
