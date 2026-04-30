import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { IOrderRepository, OrderWithItems } from '../interfaces/IOrderRepository';
import { OrderStatus } from '../enum/OrderStatus';

export class OrderRepository implements IOrderRepository {
  async findAll(page: number, limit: number): Promise<{ rows: OrderWithItems[]; count: number }> {
    const offset = (page - 1) * limit;
    const result = await Order.findAndCountAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name'] }],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });
    return result as unknown as { rows: OrderWithItems[]; count: number };
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name'] }],
        },
      ],
    });
    return order as OrderWithItems | null;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await Order.findByPk(id);
    if (!order) throw { status: 404, error: 'ORDER_NOT_FOUND' };
    return order.update({ status: status as OrderStatus });
  }
}
