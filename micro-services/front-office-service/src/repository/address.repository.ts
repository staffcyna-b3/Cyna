import Address from '../models/Address';
import { IAddressRepository } from '../interfaces/AddressRepository';

export class AddressRepository implements IAddressRepository {
  async findAllByUserId(userId: string): Promise<Address[]> {
    return Address.findAll({ where: { user_id: userId } });
  }
}
