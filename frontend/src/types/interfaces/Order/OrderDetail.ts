import type { OrderSummary } from './OrderSummary';
import type { BillingAddressSnapshot } from './BillingAddressSnapshot';

export interface OrderDetail extends OrderSummary {
  billing_address_snapshot: BillingAddressSnapshot | null;
  payment_last4: string | null;
  payment_brand: string | null;
}
