export interface SubscriptionDTO {
  id: string;
  stripe_subscription_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  cancel_at_period_end: boolean;
  start_date: string;
  end_date: string;
  price: number;
  product: {
    id: string;
    name: string;
  } | null;
}
