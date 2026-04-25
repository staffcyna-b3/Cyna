import { IHttpClient } from '../interfaces/IHttpClient';

export class HttpClient implements IHttpClient {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      throw { status: res.status, error: `HTTP_ERROR_${res.status}` };
    }
    return res.json() as Promise<T>;
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw { status: res.status, error: `HTTP_ERROR_${res.status}` };
    }
    return res.json() as Promise<T>;
  }
}
