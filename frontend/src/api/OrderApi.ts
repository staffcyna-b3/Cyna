import type { CreateOrderPayload } from '@/types/interfaces/Order/CreateOrderPayload';
import type { CreateOrderResponse } from '@/types/interfaces/Order/CreateOrderResponse';
import type { CheckoutContext } from '@/types/interfaces/Checkout/CheckoutContext';
import type { UserAddresses } from '@/types/interfaces/address/UserAddresses';
import type { AddressPayload } from '@/types/interfaces/address/AddressPayload';
import type { OrderSummary } from '@/types/interfaces/Order/OrderSummary';
import type { OrderDetail } from '@/types/interfaces/Order/OrderDetail';
import type { OrderStatus } from '@/types/enums/OrderStatus';
import { AbstractApi } from './AbstractApi';

export class OrderApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'OrderApiError';
  }
}

export class OrderApi extends AbstractApi {
  private static instance: OrderApi;

  private constructor() {
    super();
  }

  static getInstance(): OrderApi {
    if (!OrderApi.instance) {
      OrderApi.instance = new OrderApi();
    }
    return OrderApi.instance;
  }

  async getOrders(): Promise<OrderSummary[]> {
    return this.get<OrderSummary[]>('/front-office/orders');
  }

  async getOrderById(id: string): Promise<OrderDetail> {
    return this.get<OrderDetail>(`/front-office/orders/${id}`);
  }

  async getOrder(orderId: string): Promise<OrderDetail> {
    return this.getOrderById(orderId);
  }

  async saveAddresses(billing: AddressPayload, shipping: AddressPayload): Promise<UserAddresses> {
    return this.put<UserAddresses>('/front-office/addresses', { body: { billing, shipping } });
  }

  async getUserAddresses(): Promise<UserAddresses> {
    return this.get<UserAddresses>('/front-office/addresses');
  }

  async getCheckoutContext(): Promise<CheckoutContext> {
    return this.get<CheckoutContext>('/front-office/checkout/context');
  }

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    return this.post<CreateOrderResponse>('/front-office/orders', { body: payload });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.patch<void>(`/front-office/orders/${orderId}/status`, { body: { status } });
  }
}
