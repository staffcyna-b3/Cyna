import { CartItemResponse } from './CartItemResponse';

export interface CartResponse {
  id: string | null;
  items: CartItemResponse[];
  totalAmount: number;
}