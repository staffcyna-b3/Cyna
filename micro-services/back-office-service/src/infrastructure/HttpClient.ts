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
      const json = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw {
        status: res.status,
        error: json.error ?? `HTTP_ERROR_${res.status}`,
        message: json.message,
      };
    }
    return res.json() as Promise<T>;
  }
}
