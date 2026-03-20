import Address from '../models/Address';

export interface IAddressRepository {
  findAllByUserId(userId: string): Promise<Address[]>;
}