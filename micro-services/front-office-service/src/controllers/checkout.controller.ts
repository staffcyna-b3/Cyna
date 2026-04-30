import { Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { ICheckoutService } from '../interfaces/CheckoutService';
import { isValidUuid } from '../common/validation';

export class CheckoutController {
  constructor(private readonly checkoutService: ICheckoutService) {}

  async getCheckoutContext(req: Request, res: Response) {
    try {
      const userIdHeader = req.headers['x-user-id'];
      const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

      if (!isValidUuid(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const context = await this.checkoutService.getCheckoutContext(userId);
      return res.status(200).json(context);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error fetching checkout context');
    }
  }

  private handleError(res: Response, error: unknown, fallbackMessage: string) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    Logger.error(fallbackMessage, { message: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ message: 'Internal server error' });
  }
}
