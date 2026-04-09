import Subscription from '../models/Subscription';
import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { ISubscriptionRepository } from '../interfaces/ISubscriptionRepository';
import { CreateSubscriptionBody } from '../interfaces/CreateSubscriptionBody';

export class SubscriptionRepository implements ISubscriptionRepository {
  async createMany(body: CreateSubscriptionBody): Promise<number> {
    const { stripeSubscriptionId, userId, items, startDate, endDate } = body;

    const created = await Promise.all(
      items.map((item) =>
        Subscription.create({
          user_id: userId,
          product_id: item.productId,
          stripe_subscription_id: stripeSubscriptionId,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          status: SubscriptionStatus.ACTIVE,
          price: item.price,
        })
      )
    );

    return created.length;
  }

  async updateStatusByStripeId(stripeSubscriptionId: string, status: SubscriptionStatus): Promise<number> {
    const [updatedCount] = await Subscription.update(
      { status },
      { where: { stripe_subscription_id: stripeSubscriptionId } }
    );

    return updatedCount;
  }
}
