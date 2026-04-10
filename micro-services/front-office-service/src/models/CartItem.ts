import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CartItemAttributes {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  period: number | null;
  product_name: string;
  unit_price: number;
}

export interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'period'> {}

class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  declare id: string;
  declare cart_id: string;
  declare product_id: string;
  declare quantity: number;
  declare period: number | null;
  declare product_name: string;
  declare unit_price: number;
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
    period: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
