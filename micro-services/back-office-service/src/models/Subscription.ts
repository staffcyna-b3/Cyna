import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { SubscriptionStatus } from '../enum/SubscriptionStatus';

interface SubscriptionAttributes {
  id: string;
  user_id: string;
  product_id: string;
  stripe_subscription_id?: string | null;
  start_date: Date;
  end_date: Date;
  status: SubscriptionStatus;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'stripe_subscription_id'> {}

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  declare id: string;
  declare user_id: string;
  declare product_id: string;
  declare stripe_subscription_id?: string | null;
  declare start_date: Date;
  declare end_date: Date;
  declare status: SubscriptionStatus;
  declare price: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Subscription.init(
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
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
      defaultValue: SubscriptionStatus.ACTIVE,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
  }
);

export default Subscription;
