export interface BillingAddressSnapshot {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
}
