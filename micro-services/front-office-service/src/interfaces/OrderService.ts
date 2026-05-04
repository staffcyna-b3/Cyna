import { CreateOrderRequest } from "../dto/request/CreateOrderRequest";
import { GetOrderRequest } from "../dto/request/GetOrderRequest";
import { CreateOrderResponse } from "../dto/response/CreateOrderResponse";
import { GetOrderResponse } from "../dto/response/GetOrderResponse";
import { GetOrdersResponse } from "../dto/response/GetOrdersResponse";
import { OrderStatus } from "../enum/OrderStatus";

export interface IOrderService {
  createOrder(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse>;
  getOrdersByUserId(userId: string): Promise<GetOrdersResponse[]>;
  getOrderById(getOrderRequest: GetOrderRequest): Promise<GetOrderResponse>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  updateOrderStatusByPaymentIntentId(paymentIntentId: string, status: OrderStatus): Promise<void>;
  getOrderItemsByPaymentIntentId(paymentIntentId: string): Promise<{ product_id: string; quantity: number }[]>;
}