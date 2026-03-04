import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { UserRole } from './associate';

interface UserAttributes {
  id: string;
  full_name: string;
  email: string;
  password: string;
  refresh_token?: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  remember_me_token?: string | null;
  email_confirmation_token?: string | null;
  email_confirmed_at?: Date | null;
  password_reset_token?: string | null;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'email_verified' | 'refresh_token' | 'remember_me_token' | 'email_confirmation_token' | 'email_confirmed_at' | 'password_reset_token'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare full_name: string;
  declare email: string;
  declare password: string;
  declare refresh_token?: string | null;
  declare email_verified: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare remember_me_token?: string | null;
  declare email_confirmation_token?: string | null;
  declare email_confirmed_at?: Date | null;
  declare password_reset_token?: string | null;
  declare userRole?: InstanceType<typeof UserRole>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    remember_me_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_confirmation_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User;
