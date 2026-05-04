import type { OrderItem } from './OrderItem';

export interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  shipping_fee?: number;
  discount_amount?: number;
  promo_code?: string | null;
  created_at: string;
  billing_period: 'monthly' | 'yearly' | null;
  stripe_payment_intent_id: string | null;
  items: OrderItem[];
}
