import { AbstractApi } from './AbstractApi';

export class ContactApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ContactApiError';
  }
}

export class ContactApi extends AbstractApi {
  private static instance: ContactApi;

  private constructor() {
    super();
  }

  static getInstance(): ContactApi {
    if (!ContactApi.instance) {
      ContactApi.instance = new ContactApi();
    }
    return ContactApi.instance;
  }

  async submitContact(data: { email: string; subject: string; message: string }): Promise<void> {
    await this.post<void>('/front-office/support', { body: data });
  }
}
