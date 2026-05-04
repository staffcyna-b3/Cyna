import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface OrderItemAttributes {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  license_key?: string | null;
  product_name?: string | null;
}

export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'product_name' | 'license_key'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  declare id: string;
  declare order_id: string;
  declare product_id: string;
  declare quantity: number;
  declare unit_price: number;
  declare license_key: string | null;
  declare readonly product_name: string | null;
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
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    license_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    product_name: {
      type: DataTypes.VIRTUAL,
      get() {
        const product = (this as any).product;
        return product ? product.name : null;
      },
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
