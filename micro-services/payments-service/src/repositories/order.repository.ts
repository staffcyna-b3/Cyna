import Order, { OrderStatus } from '../models/Payment';
import { IOrderRepository, OrderCreationData } from '../interfaces/IOrderRepository';
import { Logger } from '../common/logger';

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
    const [affectedCount] = await Order.update(
      { status },
      { where: { stripe_payment_intent_id: paymentIntentId } }
    );

    Logger.warn(
      `[REPO] updateStatus: ${affectedCount} rows affected for PI ${paymentIntentId} → ${status}`
    );

    if (affectedCount === 0) {
      Logger.error(
        `[REPO] updateStatus: NO ROWS UPDATED for PI ${paymentIntentId} — check stripe_payment_intent_id in payments table`
      );
    }
  }
}
