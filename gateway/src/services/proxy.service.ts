import axios, { AxiosError } from 'axios';
import { MICROSERVICES } from '../config/microService.config';
import { Logger } from '../common/logger';
import { MicroServiceEnum } from '../enum/microService.enum';

export class ProxyService {
  async forward(
    microservice: MicroServiceEnum,
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, string>
  ) {
    const baseUrl = MICROSERVICES[microservice].url;
    const url = `${baseUrl}${path}`;

    try {
      Logger.info(`[PROXY] ${method} ${url}`);

      const response = await axios({
        method: method.toLowerCase(),
        url,
        data: body,
        headers,
        timeout: 10000,
      });

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Logger.error(`[PROXY ERROR] ${microservice}: ${error.message}`);
        throw {
          status: error.response?.status || 500,
          message: error.response?.data?.message || 'Microservice error',
          microservice,
        };
      }
      throw error;
    }
  }
}
