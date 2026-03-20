import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
import { ErrorHandlerService } from '../services/errorHandlet.service';
import { Logger } from '../common/logger';
import { MicroServiceEnum } from '../enum/microService.enum';
import { MICROSERVICES } from '../config/microService.config';

export class GatewayController {
  private proxyService = new ProxyService();
  private errorHandler = new ErrorHandlerService();

  async proxy(req: Request, res: Response, microservice: MicroServiceEnum) {
    try {
      const originalPath = req.baseUrl + req.path;
      Logger.info(`[GATEWAY] Proxying ${req.method} ${originalPath} to ${microservice}`);

      const headers = this.prepareHeaders(req);

      const cleanPath = originalPath.replace(/^\/api/, '');
      const servicePrefix = MICROSERVICES[microservice].routes.find((route) =>
        cleanPath === route || cleanPath.startsWith(`${route}/`)
      );
      const forwardPath = servicePrefix
        ? cleanPath.slice(servicePrefix.length) || '/'
        : cleanPath || '/';

      const response = await this.proxyService.forward(
        microservice,
        req.method,
        forwardPath,
        req.body,
        headers
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.errorHandler.handle(error, res);
    }
  }

  private prepareHeaders(req: Request): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization || '',
      'X-Forwarded-For': req.ip || '',
      'X-Request-ID': req.id || '',
      'User-Agent': req.headers['user-agent'] || '',
      'x-user-id': '00000000-0000-0000-0000-000000009999', // Placeholder for user ID, replace with actual logic to extract user info
    };
  }
}