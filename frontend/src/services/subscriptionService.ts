import type { SubscriptionDTO } from '@/types/interfaces/subscription/SubscriptionDTO.interface';

export class SubscriptionApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'SubscriptionApiError';
  }
}

const withAuth = (token: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 401) throw new SubscriptionApiError(401, 'UNAUTHORIZED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new SubscriptionApiError(res.status, (body as Record<string, string>)?.message ?? 'REQUEST_FAILED');
  }
  return res.json() as Promise<T>;
};

export async function getMySubscriptions(token: string): Promise<SubscriptionDTO[]> {
  const res = await fetch('/api/front-office/my-subscriptions', { headers: withAuth(token) });
  return handleResponse<SubscriptionDTO[]>(res);
}

export async function cancelSubscription(token: string, stripeSubscriptionId: string): Promise<SubscriptionDTO> {
  const res = await fetch(`/api/front-office/my-subscriptions/${stripeSubscriptionId}/cancel`, {
    method: 'POST',
    headers: withAuth(token),
  });
  return handleResponse<SubscriptionDTO>(res);
}

export async function getMyRefundRequests(token: string): Promise<{ stripe_subscription_id: string }[]> {
  const res = await fetch('/api/front-office/my-subscriptions/refund-requests', { headers: withAuth(token) });
  return handleResponse<{ stripe_subscription_id: string }[]>(res);
}

export async function createRefundRequest(
  token: string,
  stripeSubscriptionId: string,
  reason: string
): Promise<void> {
  const res = await fetch(`/api/front-office/my-subscriptions/${stripeSubscriptionId}/refund-request`, {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify({ reason }),
  });
  return handleResponse<void>(res);
}
