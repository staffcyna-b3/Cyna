import type { UserAdminDTO } from '@/types/interfaces/admin/UserAdminDTO.interface';
import type { OrderAdminDTO } from '@/types/interfaces/admin/OrderAdminDTO.interface';
import type { TransactionAdminDTO } from '@/types/interfaces/admin/TransactionAdminDTO.interface';
import type { RefundAdminDTO } from '@/types/interfaces/admin/RefundAdminDTO.interface';
import type { PaginatedResponse } from '@/types/interfaces/admin/PaginatedResponse.interface';
import type { CreateRefundRequest } from '@/types/interfaces/admin/CreateRefundRequest.interface';

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
    throw new BackOfficeApiError(res.status, body?.error ?? 'REQUEST_FAILED');
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
