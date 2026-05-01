import type { UserAdminDTO } from '@/types/interfaces/admin/UserAdminDTO.interface';
import type { OrderAdminDTO } from '@/types/interfaces/admin/OrderAdminDTO.interface';
import type { TransactionAdminDTO } from '@/types/interfaces/admin/TransactionAdminDTO.interface';
import type { RefundAdminDTO } from '@/types/interfaces/admin/RefundAdminDTO.interface';
import type { PaginatedResponse } from '@/types/interfaces/admin/PaginatedResponse.interface';
import type { CreateRefundRequest } from '@/types/interfaces/admin/CreateRefundRequest.interface';
import { RefundRequestAdminDTO } from '@/types/interfaces/admin/RefundRequestAdminDTO.interface';
import { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import { SubscriptionAdminDTO } from '@/types/interfaces/admin/SubscriptionAdminDTO.interface';
import { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';

export class BackOfficeApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'BackOfficeApiError';
  }
}

const withAuth = (token: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 401) throw new BackOfficeApiError(401, 'UNAUTHORIZED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new BackOfficeApiError(res.status, body?.message ?? body?.error ?? 'REQUEST_FAILED');
  }
  const json = await res.json();
  return json.data as T;
};

export async function getUsers(
  token: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<UserAdminDTO>> {
  const res = await fetch(`/api/back-office/users?page=${page}&limit=${limit}`, {
    headers: withAuth(token),
  });
  return handleResponse<PaginatedResponse<UserAdminDTO>>(res);
}

export async function getAdminOrders(
  token: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<OrderAdminDTO>> {
  const res = await fetch(`/api/back-office/orders?page=${page}&limit=${limit}`, {
    headers: withAuth(token),
  });
  return handleResponse<PaginatedResponse<OrderAdminDTO>>(res);
}

export async function getTransactions(token: string): Promise<TransactionAdminDTO[]> {
  const res = await fetch('/api/back-office/transactions', {
    headers: withAuth(token),
  });
  return handleResponse<TransactionAdminDTO[]>(res);
}

export async function getRefunds(token: string): Promise<RefundAdminDTO[]> {
  const res = await fetch('/api/back-office/refunds', {
    headers: withAuth(token),
  });
  return handleResponse<RefundAdminDTO[]>(res);
}

export async function createRefund(
  token: string,
  data: CreateRefundRequest
): Promise<RefundAdminDTO> {
  const res = await fetch('/api/back-office/refunds', {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(data),
  });
  return handleResponse<RefundAdminDTO>(res);
}

export async function updateUserRole(
  token: string,
  id: string,
  role: string
): Promise<UserAdminDTO> {
  const res = await fetch(`/api/back-office/users/${id}/role`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify({ role }),
  });
  return handleResponse<UserAdminDTO>(res);
}

export async function deleteUser(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/back-office/users/${id}`, {
    method: 'DELETE',
    headers: withAuth(token),
  });
  if (res.status === 401) throw new BackOfficeApiError(401, 'UNAUTHORIZED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new BackOfficeApiError(res.status, body?.error ?? 'REQUEST_FAILED');
  }
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: string
): Promise<OrderAdminDTO> {
  const res = await fetch(`/api/back-office/orders/${id}/status`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify({ status }),
  });
  return handleResponse<OrderAdminDTO>(res);
}

export async function cancelSubscriptionAdmin(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/back-office/subscriptions/${id}/cancel`, {
    method: 'POST',
    headers: withAuth(token),
  });
  return handleResponse<void>(res);
}

export async function getRefundRequests(token: string): Promise<RefundRequestAdminDTO[]> {
  const res = await fetch('/api/back-office/refund-requests', { headers: withAuth(token) });
  return handleResponse<RefundRequestAdminDTO[]>(res);
}

export async function getSales(token: string): Promise<SaleAdminDTO[]> {
  const res = await fetch('/api/back-office/sales', { headers: withAuth(token) });
  return handleResponse<SaleAdminDTO[]>(res);
}

export async function getSubscriptions(token: string): Promise<SubscriptionAdminDTO[]> {
  const res = await fetch('/api/back-office/subscriptions', { headers: withAuth(token) });
  return handleResponse<SubscriptionAdminDTO[]>(res);
}

export async function updateRefundRequestStatus(
  token: string,
  id: number,
  status: 'approved' | 'rejected'
): Promise<RefundRequestAdminDTO> {
  const res = await fetch(`/api/back-office/refund-requests/${id}`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify({ status }),
  });
  return handleResponse<RefundRequestAdminDTO>(res);
}

export async function getContactMessages(token: string): Promise<ContactMessageDTO[]> {
  const res = await fetch('/api/back-office/support', { headers: withAuth(token) });
  return handleResponse<ContactMessageDTO[]>(res);
}

export async function markContactAsProcessed(
  token: string,
  id: string
): Promise<ContactMessageDTO> {
  const res = await fetch(`/api/back-office/support/${id}/processed`, {
    method: 'PATCH',
    headers: withAuth(token),
  });
  return handleResponse<ContactMessageDTO>(res);
}

export async function replyToContact(
  token: string,
  id: string,
  replyMessage: string
): Promise<ContactMessageDTO> {
  const res = await fetch(`/api/back-office/support/${id}/reply`, {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify({ replyMessage }),
  });
  return handleResponse<ContactMessageDTO>(res);
}