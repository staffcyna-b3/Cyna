import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CategoryType } from '../enum/CategoryType';

interface CategoryAttributes {
  id: string;
  name: string;
  description?: string | null;
  image?: Buffer | null;
  type: CategoryType;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'created_at' | 'updated_at' | 'description' | 'image' | 'priority'> { }

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: string;
  declare name: string;
  declare description?: string | null;
  declare image?: Buffer | null;
  declare type: CategoryType;
  declare priority: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(CategoryType)),
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  }
);

export default Category;
