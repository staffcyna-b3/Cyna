import type { AddressFormData } from "@/types/interfaces/checkout/AddressFormData"
import type { ConfirmedOrder } from "@/types/interfaces/checkoutConfirmation/ConfirmedOrder"

export interface CheckoutState {
  billingAddress: AddressFormData
  shippingAddress: AddressFormData
  sameAddress: boolean
  loading: boolean
  error: string | null
  confirmedOrder: ConfirmedOrder | null
}