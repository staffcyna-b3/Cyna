import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CartItemAttributes {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
}

export interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id'> {}

class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  declare id: string;
  declare cart_id: string;
  declare product_id: string;
  declare quantity: number;
}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: false,
    underscored: true,
  }
);

export default CartItem;
