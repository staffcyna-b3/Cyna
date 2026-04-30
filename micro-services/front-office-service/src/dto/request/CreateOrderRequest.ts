export interface CreateOrderRequest {
  userId: string; // extracted from x-user-id header
  userEmail?: string; // extracted from x-user-email header by gateway
  cartId: string;
  billingAddressId: string;
  shippingAddressId: string;
  stripePaymentIntentId?: string;
}
