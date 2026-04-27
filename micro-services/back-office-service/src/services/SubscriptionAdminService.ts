import { IHttpClient } from '../interfaces/IHttpClient';
import { ISubscriptionRepository } from '../interfaces/ISubscriptionRepository';
import { SubscriptionAdminDTO } from '../dto/SubscriptionAdminDTO';
import { Logger } from '../common/logger';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class SubscriptionAdminService {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async getAll(): Promise<SubscriptionAdminDTO[]> {
    return this.subscriptionRepository.findAll();
  }

  async cancelById(id: string): Promise<{ stripeNotified: boolean }> {
    const sub = await this.subscriptionRepository.findById(id);
    if (!sub) throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });

    let stripeNotified = true;

    if (sub.stripe_subscription_id) {
      try {
        await this.httpClient.post(
          `${PAYMENTS_URL}/subscriptions/${sub.stripe_subscription_id}/cancel-now`,
          {}
        );
      } catch (err) {
        Logger.error('[SUB-ADMIN] Stripe cancel failed, cancelled locally only', {
          subscriptionId: id,
          stripeSubscriptionId: sub.stripe_subscription_id,
          err,
        });
        stripeNotified = false;
      }
    }

    await this.subscriptionRepository.cancel(id);
    return { stripeNotified };
  }
}