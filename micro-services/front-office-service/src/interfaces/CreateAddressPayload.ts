import { AddressType } from '../enum/AddressType';

export interface CreateAddressPayload {
  type: AddressType;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default?: boolean;
}
