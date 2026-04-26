export interface StripePaymentFormProps {
  amountCents: number;
  description: string;
  paymentIntentId: string;
  cartId: string | null;
  billingAddressId: string | null;
  shippingAddressId: string | null;
  promoCode?: string;
}