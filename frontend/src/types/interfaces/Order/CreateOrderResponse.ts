import type { OrderStatus } from "@/types/enums/OrderStatus"
import type { OrderItem } from "@/types/interfaces/Order/OrderItem"

export interface CreateOrderResponse {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_fee?: number
  discount_amount?: number
  promo_code?: string | null
  stripe_payment_intent_id?: string | null
  items: OrderItem[]
  billingAddress: {
    id: string
    address_line1: string
    city: string
    postcode: string
    country: string
  }
  shippingAddress: {
    id: string
    address_line1: string
    city: string
    postcode: string
    country: string
  }
  created_at: string
}