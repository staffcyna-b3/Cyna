import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CategoryType } from '../enum/CategoryType';

interface CategoryAttributes {
  id: string;
  name: string;
  description?: string | null;
  image?: Buffer | null;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'image'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: string;
  declare name: string;
  declare description?: string | null;
  declare image?: Buffer | null;
  declare type: CategoryType;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
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
