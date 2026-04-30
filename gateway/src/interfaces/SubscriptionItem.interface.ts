export interface SubscriptionItem {
  productId: string;
  priceAmountCents: number;
  currency: string;
  description: string;
  billingPeriod: 'monthly' | 'yearly';
  quantity: number;
}