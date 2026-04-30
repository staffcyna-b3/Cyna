import { HttpError } from '../common/HttpError';
import { IAddressRepository } from '../interfaces/AddressRepository';
import { IAddressService } from '../interfaces/AddressService';
import { CreateAddressPayload } from '../interfaces/CreateAddressPayload';
import Address from '../models/Address';

export class AddressService implements IAddressService {
  constructor(private readonly addressRepository: IAddressRepository) {}

  async getAll(userId: string): Promise<Address[]> {
    return this.addressRepository.findAllByUserId(userId);
  }

  async create(userId: string, data: CreateAddressPayload): Promise<Address> {
    const count = await this.addressRepository.countByUserIdAndType(userId, data.type);
    const isFirst = count === 0;

    if (data.is_default || isFirst) {
      await this.addressRepository.clearDefault(userId, data.type);
    }

    return this.addressRepository.create(userId, {
      ...data,
      is_default: isFirst ? true : (data.is_default ?? false),
    });
  }

  async update(userId: string, addressId: string, data: Partial<CreateAddressPayload>): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);
    if (!address) throw new HttpError(404, 'Address not found');
    if (address.user_id !== userId) throw new HttpError(403, 'Forbidden');

    if (data.is_default === true) {
      await this.addressRepository.clearDefault(userId, address.type);
    }

    return this.addressRepository.update(addressId, data);
  }

  async setDefault(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);
    if (!address) throw new HttpError(404, 'Address not found');
    if (address.user_id !== userId) throw new HttpError(403, 'Forbidden');

    await this.addressRepository.clearDefault(userId, address.type);
    return this.addressRepository.update(addressId, { is_default: true });
  }

  async delete(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findById(addressId);
    if (!address) throw new HttpError(404, 'Address not found');
    if (address.user_id !== userId) throw new HttpError(403, 'Forbidden');

    const wasDefault = address.is_default;
    const type = address.type;

    await this.addressRepository.delete(addressId);

    if (wasDefault) {
      const remaining = await this.addressRepository.findAllByUserId(userId);
      const next = remaining.find((a) => a.type === type);
      if (next) {
        await this.addressRepository.update(next.id, { is_default: true });
      }
    }
  }
}
