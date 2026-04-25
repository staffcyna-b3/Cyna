import { IHttpClient } from '../interfaces/IHttpClient';

const PAYMENTS_URL = process.env.MS_PAYMENTS_URL || 'http://localhost:3004';

export class SubscriptionAdminService {
  constructor(private readonly httpClient: IHttpClient) {}

  async cancelNow(stripeSubscriptionId: string): Promise<unknown> {
    return this.httpClient.post(`${PAYMENTS_URL}/subscriptions/${stripeSubscriptionId}/cancel-now`, {});
  }
}
