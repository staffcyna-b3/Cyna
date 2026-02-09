import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CartAttributes {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  declare id: string;
  declare user_id: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  }
);

export default Cart;
