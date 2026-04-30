import { OrderStatus } from '../../enum/OrderStatus';

export interface OrderItemSummary {
  id: string;
  product_name: string | null;
  unit_price: number;
  quantity: number;
  is_recurring: boolean;
}

export interface GetOrdersResponse {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  billing_period: 'monthly' | 'yearly' | null;
  stripe_payment_intent_id: string | null;
  items: OrderItemSummary[];
}
