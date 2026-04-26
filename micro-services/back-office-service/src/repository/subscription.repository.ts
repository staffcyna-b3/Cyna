import Subscription from '../models/Subscription';
import User from '../models/User';
import Product from '../models/Product';
import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { ISubscriptionRepository } from '../interfaces/ISubscriptionRepository';
import { SubscriptionAdminDTO } from '../dto/SubscriptionAdminDTO';

export class SubscriptionRepository implements ISubscriptionRepository {
  async findAll(): Promise<SubscriptionAdminDTO[]> {
    const rows = await Subscription.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return rows.map((s) => {
      const plain = s.get({ plain: true }) as any;
      return {
        id: plain.id,
        stripe_subscription_id: plain.stripe_subscription_id ?? null,
        status: plain.status,
        price: Number(plain.price),
        start_date: plain.start_date,
        end_date: plain.end_date,
        user: plain.user ?? null,
        product: plain.product ?? null,
      };
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    return Subscription.findByPk(id);
  }

  async cancel(id: string): Promise<void> {
    await Subscription.update(
      { status: SubscriptionStatus.CANCELLED },
      { where: { id } }
    );
  }
}
