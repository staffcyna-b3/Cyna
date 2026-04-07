export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isService: boolean;
  unavailable?: boolean;
  imageUrl?: string;
  billingPeriod?: string;
}