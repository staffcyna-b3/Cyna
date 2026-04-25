import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface LignePromotionAttributes {
  id: string;
  product_id: string;
  promotion_id: string;
}

export interface LignePromotionCreationAttributes extends Optional<LignePromotionAttributes, 'id'> {}

class LignePromotion extends Model<LignePromotionAttributes, LignePromotionCreationAttributes> implements LignePromotionAttributes {
  declare id: string;
  declare product_id: string;
  declare promotion_id: string;
}

LignePromotion.init(
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
    promotion_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ligne_promotions',
    timestamps: false,
    underscored: true,
  }
);

export default LignePromotion;
