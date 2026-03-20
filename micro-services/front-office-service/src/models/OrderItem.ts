import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface OrderItemAttributes {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  declare id: string;
  declare order_id: string;
  declare product_name: string;
  declare quantity: number;
  declare unit_price: number;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: false,
    underscored: true,
  }
);

export default OrderItem;
