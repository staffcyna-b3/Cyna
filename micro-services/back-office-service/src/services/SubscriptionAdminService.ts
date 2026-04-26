import { IHttpClient } from '../interfaces/IHttpClient';
import { ISubscriptionRepository } from '../interfaces/ISubscriptionRepository';
import { SubscriptionAdminDTO } from '../dto/SubscriptionAdminDTO';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class SubscriptionAdminService {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async getAll(): Promise<SubscriptionAdminDTO[]> {
    return this.subscriptionRepository.findAll();
  }

  async cancelById(id: string): Promise<void> {
    const sub = await this.subscriptionRepository.findById(id);
    if (!sub) throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });

    if (sub.stripe_subscription_id) {
      try {
        await this.httpClient.post(
          `${PAYMENTS_URL}/subscriptions/${sub.stripe_subscription_id}/cancel-now`,
          {}
        );
      } catch {
        // Stripe call failed — still cancel locally
      }
    }

    await this.subscriptionRepository.cancel(id);
  }
}
