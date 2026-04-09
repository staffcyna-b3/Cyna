export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  isRecurring?: boolean;
  billingPeriod?: 'monthly' | 'yearly';
  imageUrl?: string;
}