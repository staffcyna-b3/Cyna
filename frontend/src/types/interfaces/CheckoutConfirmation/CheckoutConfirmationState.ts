import type { ConfirmationItem } from "@/types/interfaces/checkoutConfirmation/ConfirmationItem"
import type { ConfirmedOrder } from "@/types/interfaces/checkoutConfirmation/ConfirmedOrder"

export interface CheckoutConfirmationState {
  order?: ConfirmedOrder
  items?: ConfirmationItem[]
  billingAddress?: {
    firstName: string
    lastName: string
    addressLine1: string
    city: string
    postcode: string
    country: string
  }
  shippingAddress?: {
    firstName: string
    lastName: string
    addressLine1: string
    city: string
    postcode: string
    country: string
  }
  total_amount?: number
  paymentIntentId?: string
}