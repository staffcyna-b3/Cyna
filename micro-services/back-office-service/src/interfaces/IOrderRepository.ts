import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';

export type OrderItemWithProduct = OrderItem & { product?: Product };
export type OrderWithItems = Order & { items?: OrderItemWithProduct[] };

export interface IOrderRepository {
  findAll(page: number, limit: number): Promise<{ rows: OrderWithItems[]; count: number }>;
  findById(id: string): Promise<OrderWithItems | null>;
}
