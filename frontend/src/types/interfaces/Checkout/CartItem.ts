export interface CartItem {
  id: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
  type?: string
}