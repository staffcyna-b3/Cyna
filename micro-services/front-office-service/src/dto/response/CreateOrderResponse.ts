import { OrderItemResponse } from './OrderItemResponse';
import { AddressSnapshotResponse } from './AddressSnapshotResponse';
import { OrderStatus } from '../../enum/OrderStatus';

// Matches: micro-services/front-office-service/src/models/Order.ts
export interface CreateOrderResponse {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItemResponse[];
  billingAddress: AddressSnapshotResponse;
  shippingAddress: AddressSnapshotResponse;
  created_at: string;
}
