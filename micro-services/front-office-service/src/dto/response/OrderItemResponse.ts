// Matches: micro-services/front-office-service/src/models/OrderItem.ts
export interface OrderItemResponse {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  license_key: string | null;
}
