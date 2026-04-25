export interface OrderItem {
  id: string;
  product_name: string | null;
  unit_price: number;
  quantity: number;
  is_recurring: boolean;
}
