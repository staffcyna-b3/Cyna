import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum RefundRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

interface RefundRequestAttributes {
  id: number;
  user_id: string;
  stripe_subscription_id: string;
  stripe_payment_intent_id: string | null;
  reason: string;
  status: RefundRequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface RefundRequestCreationAttributes
  extends Optional<RefundRequestAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'stripe_payment_intent_id'> {}

class RefundRequest
  extends Model<RefundRequestAttributes, RefundRequestCreationAttributes>
  implements RefundRequestAttributes
{
  declare id: number;
  declare user_id: string;
  declare stripe_subscription_id: string;
  declare stripe_payment_intent_id: string | null;
  declare reason: string;
  declare status: RefundRequestStatus;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

RefundRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RefundRequestStatus)),
      defaultValue: RefundRequestStatus.PENDING,
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
    tableName: 'refund_requests',
    timestamps: true,
    underscored: true,
  }
);

export default RefundRequest;
