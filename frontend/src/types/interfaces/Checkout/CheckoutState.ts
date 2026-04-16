import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { ConfirmedOrder } from "@/types/interfaces/CheckoutConfirmation/ConfirmedOrder"

export interface CheckoutState {
  billingAddress: AddressFormData
  shippingAddress: AddressFormData
  sameAddress: boolean
  loading: boolean
  error: string | null
  confirmedOrder: ConfirmedOrder | null
}