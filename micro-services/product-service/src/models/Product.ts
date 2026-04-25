import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ProductStatus } from '../enum/ProductStatus';
import Category from './Category';

interface ProductAttributes {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  is_service: boolean;
  duration?: number | null;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'created_at' | 'updated_at' | 'stock' | 'status' | 'is_service' | 'priority' | 'description' | 'duration'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: string;
  declare category_id: string;
  declare name: string;
  declare description?: string | null;
  declare price: number;
  declare stock: number;
  declare status: ProductStatus;
  declare is_service: boolean;
  declare duration?: number | null;
  declare priority: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare category: Category;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProductStatus)),
      defaultValue: ProductStatus.AVAILABLE,
    },
    is_service: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
);

export default Product;
