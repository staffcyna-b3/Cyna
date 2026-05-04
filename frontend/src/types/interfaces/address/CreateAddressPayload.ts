export interface CreateAddressPayload {
  type: 'billing' | 'shipping';
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default?: boolean;
}
