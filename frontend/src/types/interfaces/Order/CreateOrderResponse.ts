import type { OrderStatus } from "@/types/enums/OrderStatus"
import type { OrderItem } from "@/types/interfaces/Order/OrderItem"

export interface CreateOrderResponse {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
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