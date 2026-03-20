export interface GetOrderRequest {
  orderId: string;
  userId: string; // extracted from x-user-id header
  userEmail?: string; // extracted from x-user-email header by gateway
}
