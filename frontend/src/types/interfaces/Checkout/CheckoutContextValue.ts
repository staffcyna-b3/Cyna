import type { AddressFormData } from "@/types/interfaces/Checkout/AddressFormData"
import type { CheckoutState } from "@/types/interfaces/Checkout/CheckoutState"
import type { ConfirmedOrder } from "@/types/interfaces/CheckoutConfirmation/ConfirmedOrder"

export interface CheckoutContextValue extends CheckoutState {
  setBillingAddress: (data: AddressFormData) => void
  setShippingAddress: (data: AddressFormData) => void
  setSameAddress: (value: boolean) => void
  setLoading: (value: boolean) => void
  setError: (value: string | null) => void
  setConfirmedOrder: (value: ConfirmedOrder | null) => void
  resetCheckoutState: () => void
}