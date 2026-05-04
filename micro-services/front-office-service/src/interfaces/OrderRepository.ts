import Address from "../models/Address";
import Cart from "../models/Cart";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import { OrderStatus } from "../enum/OrderStatus";
import { OrderCreationAttributes } from "../models/Order";
import { OrderItemCreationAttributes } from "../models/OrderItem";

export interface IOrderRepository {
  findAddressByIdAndUserId(id: string, userId: string): Promise<Address | null>;
  findCartWithItemsByIdAndUserId(id: string, userId: string): Promise<Cart | null>;
  clearCartItems(cartId: string): Promise<number>;
  create(data: OrderCreationAttributes): Promise<Order>;
  createItems(items: OrderItemCreationAttributes[]): Promise<OrderItem[]>;
  findAllByUserId(userId: string): Promise<Order[]>;
  findByIdWithItems(id: string): Promise<Order | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
  updateStatusByPaymentIntentId(paymentIntentId: string, status: OrderStatus): Promise<boolean>;
  findItemsByPaymentIntentId(paymentIntentId: string): Promise<{ product_id: string; quantity: number }[]>;
}