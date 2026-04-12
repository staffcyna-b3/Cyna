import Address from '../models/Address';
import { AddressType } from '../enum/AddressType';
import { AddressUpsertData } from './AddressUpsertData';

export interface IAddressRepository {
  findAllByUserId(userId: string): Promise<Address[]>;
  upsertByType(userId: string, type: AddressType, data: AddressUpsertData): Promise<Address>;
}