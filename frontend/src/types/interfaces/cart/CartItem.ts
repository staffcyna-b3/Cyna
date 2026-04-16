export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isService: boolean;
  period?: number;
  unavailable?: boolean;
  imageUrl?: string;
  stock?: number;
}