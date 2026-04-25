import Address from '../models/Address';
import { IAddressRepository } from '../interfaces/AddressRepository';
import { AddressUpsertData } from '../interfaces/AddressUpsertData';
import { AddressType } from '../enum/AddressType';

export class AddressRepository implements IAddressRepository {
  async findAllByUserId(userId: string): Promise<Address[]> {
    return Address.findAll({ where: { user_id: userId } });
  }

  async upsertByType(userId: string, type: AddressType, data: AddressUpsertData): Promise<Address> {
    const existing = await Address.findOne({ where: { user_id: userId, type } });
    if (existing) {
      await existing.update({
        address_line1: data.addressLine1,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
      });
      return existing;
    }
    return Address.create({
      user_id: userId,
      type,
      address_line1: data.addressLine1,
      city: data.city,
      postcode: data.postcode,
      country: data.country,
    });
  }
}
