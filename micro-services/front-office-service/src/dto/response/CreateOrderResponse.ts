import { OrderItemResponse } from './OrderItemResponse';
import { AddressSnapshotResponse } from './AddressSnapshotResponse';

export interface CreateOrderResponse {
  id: string;
  userId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  items: OrderItemResponse[];
  billingAddress: AddressSnapshotResponse;
  shippingAddress: AddressSnapshotResponse;
  createdAt: string; // ISO date string
}
