export interface HttpClientConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface IHttpClient {
  post(url: string, data: unknown, config?: HttpClientConfig): Promise<void>;
  patch(url: string, data: unknown, config?: HttpClientConfig): Promise<void>;
}
