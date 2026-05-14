import { Response } from 'express';
import { Logger } from '../common/logger';

export class ErrorHandlerService {
  handle(error: any, res: Response) {
    const status = error.status || 500;
    const code = error.error || 'GATEWAY_ERROR';
    const message = error.message || 'Une erreur est survenue';

    Logger.error(`[GATEWAY ERROR] ${code}: ${message}`);

    res.status(status).json({
      success: false,
      error: code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
