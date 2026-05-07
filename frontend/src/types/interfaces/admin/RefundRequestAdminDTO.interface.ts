export interface RefundRequestAdminDTO {
  id: number;
  user_id: string;
  stripe_subscription_id: string;
  stripe_payment_intent_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
