import axios from 'axios';
import { IHttpClient, HttpClientConfig } from '../interfaces/IHttpClient';

export class AxiosHttpClient implements IHttpClient {
  async post(url: string, data: unknown, config?: HttpClientConfig): Promise<void> {
    await axios.post(url, data, config);
  }

  async patch(url: string, data: unknown, config?: HttpClientConfig): Promise<void> {
    await axios.patch(url, data, config);
  }
}
