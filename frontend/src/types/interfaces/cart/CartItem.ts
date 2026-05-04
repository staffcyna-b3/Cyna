export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountedUnitPrice?: number;
  subtotal: number;
  isService: boolean;
  period?: number;
  durationMonths?: number;
  unavailable?: boolean;
  imageUrl?: string;
  stock?: number;
  unitPriceCents: number;
  originalUnitPriceCents?: number;
  billingPeriod?: 'monthly' | 'yearly';
  isRecurring?: boolean;
}