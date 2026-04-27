export interface SubscriptionAdminDTO {
  id: string;
  stripe_subscription_id: string | null;
  status: string;
  price: number;
  start_date: Date;
  end_date: Date | null;
  user: { id: string; full_name: string; email: string } | null;
  product: { id: string; name: string } | null;
}
