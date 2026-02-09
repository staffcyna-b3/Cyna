import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ProductImageAttributes {
  id: string;
  product_id: string;
  image: Buffer;
  alt_text?: string | null;
  is_main: boolean;
}

export interface ProductImageCreationAttributes extends Optional<ProductImageAttributes, 'id' | 'is_main' | 'alt_text'> {}

class ProductImage extends Model<ProductImageAttributes, ProductImageCreationAttributes> implements ProductImageAttributes {
  declare id: string;
  declare product_id: string;
  declare image: Buffer;
  declare alt_text?: string | null;
  declare is_main: boolean;
}

ProductImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image: {
      type: DataTypes.BLOB('long'),
      allowNull: false,
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'product_images',
    timestamps: false,
    underscored: true,
  }
);

export default ProductImage;
