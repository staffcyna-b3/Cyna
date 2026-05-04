import type { ConfirmationItem } from "@/types/interfaces/CheckoutConfirmation/ConfirmationItem"
import type { ConfirmedOrder } from "@/types/interfaces/CheckoutConfirmation/ConfirmedOrder"

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
  shippingFee?: number
  discountAmount?: number
  promoCode?: string
  paymentIntentId?: string
}