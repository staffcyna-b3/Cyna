import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UserRoleType } from '../enum/UserRoleType';

interface UserRoleAttributes {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: Date;
  updated_at: Date;
}

export interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id' | 'created_at' | 'updated_at'> {}

class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  declare id: string;
  declare user_id: string;
  declare role: UserRoleType;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

UserRole.init(
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
    role: {
      type: DataTypes.ENUM(...Object.values(UserRoleType)),
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
    tableName: 'user_roles',
    timestamps: true,
    underscored: true,
  }
);

export default UserRole;
