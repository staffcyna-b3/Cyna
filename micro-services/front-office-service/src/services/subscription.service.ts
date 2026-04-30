import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { ISubscriptionRepository } from '../interfaces/ISubscriptionRepository';
import { CreateSubscriptionBody } from '../interfaces/CreateSubscriptionBody';
import { Logger } from '../common/logger';

export class SubscriptionService {
  constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

  async create(body: CreateSubscriptionBody): Promise<number> {
    const count = await this.subscriptionRepository.createMany(body);

    Logger.info('[SUBSCRIPTION] Subscriptions created from Stripe', {
      stripeSubscriptionId: body.stripeSubscriptionId,
      userId: body.userId,
      count,
    });

    return count;
  }

  async updateStatus(stripeSubscriptionId: string, status: string): Promise<number> {
    const validStatuses = Object.values(SubscriptionStatus) as string[];

    if (!validStatuses.includes(status)) {
      throw {
        status: 400,
        code: 'INVALID_STATUS',
        message: `Status invalide. Valeurs acceptées : ${validStatuses.join(', ')}`,
      };
    }

    const updatedCount = await this.subscriptionRepository.updateStatusByStripeId(
      stripeSubscriptionId,
      status as SubscriptionStatus
    );

    Logger.info('[SUBSCRIPTION] Status updated from Stripe event', {
      stripeSubscriptionId,
      status,
      updatedCount,
    });

    return updatedCount;
  }
}
