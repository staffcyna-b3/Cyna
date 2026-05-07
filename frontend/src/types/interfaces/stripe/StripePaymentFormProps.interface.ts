import type { CartItem } from '@/types/interfaces/cart/CartItem';

export interface StripePaymentFormProps {
  amountCents: number;
  description: string;
  paymentIntentId: string;
  cartId: string | null;
  billingAddressId: string | null;
  shippingAddressId: string | null;
  promoCode?: string;
  discountCents: number;
  shippingFeeCents: number;
  cartItems: CartItem[];
}