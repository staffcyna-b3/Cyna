import type { UserAdminDTO } from '@/types/interfaces/admin/UserAdminDTO.interface';
import type { OrderAdminDTO } from '@/types/interfaces/admin/OrderAdminDTO.interface';
import type { RefundAdminDTO } from '@/types/interfaces/admin/RefundAdminDTO.interface';
import type { PaginatedResponse } from '@/types/interfaces/admin/PaginatedResponse.interface';
import type { CreateRefundRequest } from '@/types/interfaces/admin/CreateRefundRequest.interface';
import type { RefundRequestAdminDTO } from '@/types/interfaces/admin/RefundRequestAdminDTO.interface';
import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import type { SubscriptionAdminDTO } from '@/types/interfaces/admin/SubscriptionAdminDTO.interface';
import type { ContactMessageDTO } from '@/types/interfaces/admin/ContactMessageDTO.interface';
import { AbstractApi } from './AbstractApi';

export class BackOfficeApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'BackOfficeApiError';
  }
}

export class BackOfficeOrderApi extends AbstractApi {
  private static instance: BackOfficeOrderApi;

  private constructor() {
    super();
  }

  static getInstance(): BackOfficeOrderApi {
    if (!BackOfficeOrderApi.instance) {
      BackOfficeOrderApi.instance = new BackOfficeOrderApi();
    }
    return BackOfficeOrderApi.instance;
  }

  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<UserAdminDTO>> {
    const res = await this.get<{ data: PaginatedResponse<UserAdminDTO> }>(`/back-office/users?page=${page}&limit=${limit}`);
    return res.data;
  }

  async getAdminOrders(page = 1, limit = 20): Promise<PaginatedResponse<OrderAdminDTO>> {
    const res = await this.get<{ data: PaginatedResponse<OrderAdminDTO> }>(`/back-office/orders?page=${page}&limit=${limit}`);
    return res.data;
  }

  async getRefunds(): Promise<RefundAdminDTO[]> {
    const res = await this.get<{ data: RefundAdminDTO[] }>('/back-office/refunds');
    return res.data;
  }

  async createRefund(data: CreateRefundRequest): Promise<RefundAdminDTO> {
    const res = await this.post<{ data: RefundAdminDTO }>('/back-office/refunds', { body: data });
    return res.data;
  }

  async updateUserRole(id: string, role: string): Promise<UserAdminDTO> {
    const res = await this.patch<{ data: UserAdminDTO }>(`/back-office/users/${id}/role`, { body: { role } });
    return res.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete<void>(`/back-office/users/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderAdminDTO> {
    const res = await this.patch<{ data: OrderAdminDTO }>(`/back-office/orders/${id}/status`, { body: { status } });
    return res.data;
  }

  async cancelSubscriptionAdmin(id: string): Promise<void> {
    await this.post<void>(`/back-office/subscriptions/${id}/cancel`);
  }

  async getRefundRequests(): Promise<RefundRequestAdminDTO[]> {
    const res = await this.get<{ data: RefundRequestAdminDTO[] }>('/back-office/refund-requests');
    return res.data;
  }

  async getSales(): Promise<SaleAdminDTO[]> {
    const res = await this.get<{ data: SaleAdminDTO[] }>('/back-office/sales');
    return res.data;
  }

  async getSubscriptions(): Promise<SubscriptionAdminDTO[]> {
    const res = await this.get<{ data: SubscriptionAdminDTO[] }>('/back-office/subscriptions');
    return res.data;
  }

  async updateRefundRequestStatus(id: number, status: 'approved' | 'rejected'): Promise<RefundRequestAdminDTO> {
    const res = await this.patch<{ data: RefundRequestAdminDTO }>(`/back-office/refund-requests/${id}`, { body: { status } });
    return res.data;
  }

  async getContactMessages(): Promise<ContactMessageDTO[]> {
    const res = await this.get<{ data: ContactMessageDTO[] }>('/back-office/support');
    return res.data;
  }

  async markContactAsProcessed(id: string): Promise<ContactMessageDTO> {
    const res = await this.patch<{ data: ContactMessageDTO }>(`/back-office/support/${id}/processed`);
    return res.data;
  }

  async replyToContact(id: string, replyMessage: string): Promise<ContactMessageDTO> {
    const res = await this.post<{ data: ContactMessageDTO }>(`/back-office/support/${id}/reply`, { body: { replyMessage } });
    return res.data;
  }
}
