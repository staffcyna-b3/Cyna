import User from '../models/User';
import { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';

export class PaymentUserRepository implements IPaymentUserRepository {
  async findStripeCustomerId(userId: string): Promise<string | null> {
    const user = await User.findOne({ where: { id: userId }, attributes: ['stripe_customer_id'] });
    return user?.stripe_customer_id ?? null;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await User.update({ stripe_customer_id: customerId }, { where: { id: userId } });
  }

  async findEmailById(userId: string): Promise<string | null> {
    const user = await User.findOne({ where: { id: userId }, attributes: ['email'] });
    return user?.email ?? null;
  }
}
