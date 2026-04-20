import Address from '../models/Address';
import { CreateAddressPayload } from './CreateAddressPayload';

export interface IAddressService {
  getAll(userId: string): Promise<Address[]>;
  create(userId: string, data: CreateAddressPayload): Promise<Address>;
  update(userId: string, addressId: string, data: Partial<CreateAddressPayload>): Promise<Address>;
  setDefault(userId: string, addressId: string): Promise<Address>;
  delete(userId: string, addressId: string): Promise<void>;
}
