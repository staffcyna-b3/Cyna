export interface UpsertAddressesResult {
  billing: { id: string; addressLine1: string; city: string; postcode: string; country: string };
  shipping: { id: string; addressLine1: string; city: string; postcode: string; country: string };
}
