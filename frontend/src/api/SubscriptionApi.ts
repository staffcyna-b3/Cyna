import type { SubscriptionDTO } from '@/types/interfaces/subscription/SubscriptionDTO.interface';
import { AbstractApi } from './AbstractApi';

export class SubscriptionApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'SubscriptionApiError';
  }
}

export class SubscriptionApi extends AbstractApi {
  private static instance: SubscriptionApi;

  private constructor() {
    super();
  }

  static getInstance(): SubscriptionApi {
    if (!SubscriptionApi.instance) {
      SubscriptionApi.instance = new SubscriptionApi();
    }
    return SubscriptionApi.instance;
  }

  async getMySubscriptions(): Promise<SubscriptionDTO[]> {
    return this.get<SubscriptionDTO[]>('/front-office/my-subscriptions');
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<SubscriptionDTO> {
    return this.post<SubscriptionDTO>(`/front-office/my-subscriptions/${stripeSubscriptionId}/cancel`);
  }

  async getMyRefundRequests(): Promise<{ stripe_subscription_id: string }[]> {
    return this.get<{ stripe_subscription_id: string }[]>('/front-office/my-subscriptions/refund-requests');
  }

  async reactivateSubscription(stripeSubscriptionId: string): Promise<SubscriptionDTO> {
    return this.post<SubscriptionDTO>(`/front-office/my-subscriptions/${stripeSubscriptionId}/reactivate`);
  }

  async createRefundRequest(stripeSubscriptionId: string, reason: string): Promise<void> {
    await this.post<void>(`/front-office/my-subscriptions/${stripeSubscriptionId}/refund-request`, { body: { reason } });
  }
}
