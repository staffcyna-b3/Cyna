export interface ConfirmedOrder {
  id: string
  total_amount: number
  shipping_fee?: number
  discount_amount?: number
  promo_code?: string | null
  items: Array<{
    id: string
    product_name: string
    quantity: number
    unit_price: number
  }>
}