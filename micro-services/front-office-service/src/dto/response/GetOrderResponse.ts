import { OrderItemResponse } from './OrderItemResponse';
import { AddressSnapshotResponse } from './AddressSnapshotResponse';
import { OrderStatus } from '../../enum/OrderStatus';

export interface BillingAddressSnapshot {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country: string;
}

// Matches: micro-services/front-office-service/src/models/Order.ts
export interface GetOrderResponse {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  promo_code: string | null;
  billing_period: 'monthly' | 'yearly' | null;
  stripe_payment_intent_id: string | null;
  items: OrderItemResponse[];
  billing_address_snapshot: BillingAddressSnapshot | null;
  billingAddress: AddressSnapshotResponse;
  shippingAddress: AddressSnapshotResponse;
  // TODO: populate from GET /api/payments/:paymentIntentId once Marie's endpoint is available
  payment_last4: string | null;
  payment_brand: string | null;
  created_at: string;
}
