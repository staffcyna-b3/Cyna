import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Minimal User model — only the fields required by PaymentUserRepository.
// The full users table is owned by the gateway; this model is read-only from payments-service.
interface UserAttributes {
  id: string;
  email: string;
  stripe_customer_id?: string | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'stripe_customer_id'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare stripe_customer_id?: string | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    stripe_customer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
    underscored: true,
  }
);

export default User;
