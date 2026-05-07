import { Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { IPromoService } from '../interfaces/IPromoService';

export class PromoController {
  constructor(private readonly promoService: IPromoService) {}

  async applyPromo(req: Request, res: Response) {
    try {
      const userIdHeader = req.headers['x-user-id'];
      const userId = (Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader) ?? '';
      const code = ((req.body.code as string) ?? '').trim().toUpperCase();

      const result = await this.promoService.validateForCart(userId, code);
      return res.status(200).json(result);
    } catch (error) {
      return this.handleError(res, error, "Erreur lors de l'application du code promo");
    }
  }

  private handleError(res: Response, error: unknown, fallbackMessage: string) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    Logger.error(fallbackMessage, {
      message: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
