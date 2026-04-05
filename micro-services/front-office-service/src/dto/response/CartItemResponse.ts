export interface CartItemResponse {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isService: boolean;
  imageUrl?: string;
}
