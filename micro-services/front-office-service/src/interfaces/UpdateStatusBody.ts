export interface UpdateStatusBody {
  stripeSubscriptionId: string;
  status: 'active' | 'inactive' | 'cancelled';
}