export interface CreateOrderPayload {
  cartId: string
  billingAddressId: string
  shippingAddressId: string
  stripePaymentIntentId?: string
}