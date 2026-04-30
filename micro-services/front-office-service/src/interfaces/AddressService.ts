import { AddressUpsertData } from './AddressUpsertData';
import { UpsertAddressesResult } from './UpsertAddressesResult';

export interface GetAddressesResult {
  billing: { id: string; addressLine1: string; city: string; postcode: string; country: string } | null;
  shipping: { id: string; addressLine1: string; city: string; postcode: string; country: string } | null;
}

export interface IAddressService {
  getAddresses(userId: string): Promise<GetAddressesResult>;
  upsertAddresses(userId: string, billing: AddressUpsertData, shipping: AddressUpsertData): Promise<UpsertAddressesResult>;
}
