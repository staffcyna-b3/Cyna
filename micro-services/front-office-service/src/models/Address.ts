import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { AddressType } from '../enum/AddressType';

interface AddressAttributes {
  id: string;
  user_id: string;
  type: AddressType;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'created_at' | 'updated_at' | 'address_line2' | 'is_default'> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  declare id: string;
  declare user_id: string;
  declare type: AddressType;
  declare address_line1: string;
  declare address_line2?: string | null;
  declare city: string;
  declare postcode: string;
  declare country: string;
  declare is_default: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(AddressType)),
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    postcode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
  }
);

export default Address;
