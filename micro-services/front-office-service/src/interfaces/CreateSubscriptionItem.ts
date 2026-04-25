export interface CreateSubscriptionItem {
  productId: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
}