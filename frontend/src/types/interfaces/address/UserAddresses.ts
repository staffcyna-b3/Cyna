export interface UserAddresses {
  billing: { id: string; addressLine1: string; city: string; postcode: string; country: string } | null
  shipping: { id: string; addressLine1: string; city: string; postcode: string; country: string } | null
}