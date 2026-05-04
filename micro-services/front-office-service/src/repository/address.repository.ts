import Address from '../models/Address';
import { IAddressRepository } from '../interfaces/AddressRepository';
import { CreateAddressPayload } from '../interfaces/CreateAddressPayload';
import { AddressType } from '../enum/AddressType';

export class AddressRepository implements IAddressRepository {
  async findAllByUserId(userId: string): Promise<Address[]> {
    return Address.findAll({ where: { user_id: userId } });
  }

  async findById(id: string): Promise<Address | null> {
    return Address.findByPk(id);
  }

  async create(userId: string, data: CreateAddressPayload): Promise<Address> {
    return Address.create({
      user_id: userId,
      type: data.type,
      address_line1: data.address_line1,
      address_line2: data.address_line2 ?? null,
      city: data.city,
      postcode: data.postcode,
      country: data.country,
      is_default: data.is_default ?? false,
    });
  }

  async update(id: string, data: Partial<CreateAddressPayload>): Promise<Address> {
    const address = await Address.findByPk(id);
    if (!address) throw new Error(`Address ${id} not found`);
    const updateFields: Record<string, unknown> = {};
    if (data.address_line1 !== undefined) updateFields.address_line1 = data.address_line1;
    if (data.address_line2 !== undefined) updateFields.address_line2 = data.address_line2;
    if (data.city !== undefined) updateFields.city = data.city;
    if (data.postcode !== undefined) updateFields.postcode = data.postcode;
    if (data.country !== undefined) updateFields.country = data.country;
    if (data.is_default !== undefined) updateFields.is_default = data.is_default;
    await address.update(updateFields);
    return address;
  }

  async delete(id: string): Promise<void> {
    await Address.destroy({ where: { id } });
  }

  async findDefault(userId: string, type: AddressType): Promise<Address | null> {
    return Address.findOne({ where: { user_id: userId, type, is_default: true } });
  }

  async clearDefault(userId: string, type: AddressType): Promise<void> {
    await Address.update(
      { is_default: false },
      { where: { user_id: userId, type, is_default: true } }
    );
  }

  async countByUserIdAndType(userId: string, type: AddressType): Promise<number> {
    return Address.count({ where: { user_id: userId, type } });
  }
}
