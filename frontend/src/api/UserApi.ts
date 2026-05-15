import type { UserProfile } from '@/types/interfaces/user/UserProfile';
import type { UpdateProfilePayload } from '@/types/interfaces/user/UpdateProfilePayload';
import type { ChangePasswordPayload } from '@/types/interfaces/user/ChangePasswordPayload';
import { AbstractApi } from './AbstractApi';

export class UserApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'UserApiError';
  }
}

export class UserApi extends AbstractApi {
  private static instance: UserApi;

  private constructor() {
    super();
  }

  static getInstance(): UserApi {
    if (!UserApi.instance) {
      UserApi.instance = new UserApi();
    }
    return UserApi.instance;
  }

  async getProfile(): Promise<UserProfile> {
    const body = await this.get<{ data: { user: UserProfile } }>('/auth/me');
    return body.data.user;
  }

  async updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
    const body = await this.patch<{ data: { user: UserProfile } }>('/auth/me', { body: data });
    return body.data.user;
  }

  async changePassword(data: ChangePasswordPayload): Promise<void> {
    await this.patch<void>('/auth/password', { body: data });
  }
}
