import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { PromotionType } from '../enum/PromotionType';

interface PromotionAttributes {
  id: string;
  code: string;
  discount_type: PromotionType;
  discount_value: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PromotionCreationAttributes extends Optional<PromotionAttributes, 'id' | 'created_at' | 'updated_at' | 'active'> {}

class Promotion extends Model<PromotionAttributes, PromotionCreationAttributes> implements PromotionAttributes {
  declare id: string;
  declare code: string;
  declare discount_type: PromotionType;
  declare discount_value: number;
  declare active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Promotion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    discount_type: {
      type: DataTypes.ENUM(...Object.values(PromotionType)),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
  }
);

export default Promotion;
