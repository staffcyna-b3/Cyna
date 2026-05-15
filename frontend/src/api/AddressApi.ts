import type { Address } from '@/types/interfaces/address/Address';
import type { CreateAddressPayload } from '@/types/interfaces/address/CreateAddressPayload';
import { AbstractApi } from './AbstractApi';

export class AddressApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'AddressApiError';
  }
}

export class AddressApi extends AbstractApi {
  private static instance: AddressApi;

  private constructor() {
    super();
  }

  static getInstance(): AddressApi {
    if (!AddressApi.instance) {
      AddressApi.instance = new AddressApi();
    }
    return AddressApi.instance;
  }

  async getAddresses(): Promise<Address[]> {
    return this.get<Address[]>('/front-office/addresses');
  }

  async createAddress(data: CreateAddressPayload): Promise<Address> {
    return this.post<Address>('/front-office/addresses', { body: data });
  }

  async updateAddress(id: string, data: Partial<CreateAddressPayload>): Promise<Address> {
    return this.put<Address>(`/front-office/addresses/${id}`, { body: data });
  }

  async deleteAddress(id: string): Promise<void> {
    await this.delete<void>(`/front-office/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<Address> {
    return this.patch<Address>(`/front-office/addresses/${id}/default`);
  }
}
