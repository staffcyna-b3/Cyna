import axios from 'axios';
import { IHttpClient, HttpClientConfig } from '../interfaces/IHttpClient';

export class AxiosHttpClient implements IHttpClient {
  async get<T>(url: string, config?: HttpClientConfig): Promise<T> {
    const response = await axios.get<T>(url, config);
    return response.data;
  }

  async post(url: string, data: unknown, config?: HttpClientConfig): Promise<void> {
    await axios.post(url, data, config);
  }

  async patch(url: string, data: unknown, config?: HttpClientConfig): Promise<void> {
    await axios.patch(url, data, config);
  }
}
