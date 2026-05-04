export interface HttpClientConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface IHttpClient {
  get<T>(url: string, config?: HttpClientConfig): Promise<T>;
  post(url: string, data: unknown, config?: HttpClientConfig): Promise<void>;
  patch(url: string, data: unknown, config?: HttpClientConfig): Promise<void>;
}
