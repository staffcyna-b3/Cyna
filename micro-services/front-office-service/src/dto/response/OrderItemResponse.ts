export interface OrderItemResponse {
  id: string;
  productName: string; // snapshotted at order creation
  quantity: number;
  unitPrice: number;
  lineTotal: number; // quantity * unitPrice
}
