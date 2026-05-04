import Address from '../models/Address';
import { AddressType } from '../enum/AddressType';
import { CreateAddressPayload } from './CreateAddressPayload';

export interface IAddressRepository {
  findAllByUserId(userId: string): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  create(userId: string, data: CreateAddressPayload): Promise<Address>;
  update(id: string, data: Partial<CreateAddressPayload>): Promise<Address>;
  delete(id: string): Promise<void>;
  clearDefault(userId: string, type: AddressType): Promise<void>;
  countByUserIdAndType(userId: string, type: AddressType): Promise<number>;
}
