import Order, { OrderStatus } from '../models/Payment';
import { IOrderRepository, OrderCreationData } from '../interfaces/IOrderRepository';

export class OrderRepository implements IOrderRepository {
  async create(data: OrderCreationData): Promise<void> {
    await Order.create(data);
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<{ status: OrderStatus } | null> {
    return await Order.findOne({
      where: { stripe_payment_intent_id: paymentIntentId },
      attributes: ['status'],
    });
  }

  async updateStatusByPaymentIntentId(paymentIntentId: string, status: OrderStatus): Promise<void> {
    await Order.update(
      { status },
      { where: { stripe_payment_intent_id: paymentIntentId } }
    );
  }
}
