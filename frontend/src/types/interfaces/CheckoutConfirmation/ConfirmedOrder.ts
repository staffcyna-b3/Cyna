export interface ConfirmedOrder {
  id: string
  total_amount: number
  items: Array<{
    id: string
    product_name: string
    quantity: number
    unit_price: number
  }>
}