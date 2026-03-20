import { CreateOrderRequest } from "../dto/request/CreateOrderRequest";
import { GetOrderRequest } from "../dto/request/GetOrderRequest";
import { CreateOrderResponse } from "../dto/response/CreateOrderResponse";
import { GetOrderResponse } from "../dto/response/GetOrderResponse";
import { OrderStatus } from "../enum/OrderStatus";

export interface IOrderService {
  createOrder(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse>;
  getOrderById(getOrderRequest: GetOrderRequest): Promise<GetOrderResponse>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
}
