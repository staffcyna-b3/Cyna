import { Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { IPromoService, PromoCartItem } from '../interfaces/IPromoService';
import { ICartService } from '../interfaces/CartService';

export class PromoController {
  constructor(
    private readonly promoService: IPromoService,
    private readonly cartService: ICartService,
  ) {}

  async applyPromo(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const code = req.body.code as string;
      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(422).json({ message: 'Le champ code est requis' });
      }

      const cart = await this.cartService.getCart(userId);

      if (!cart.items.length) {
        return res.status(422).json({ message: 'Votre panier est vide' });
      }

      const cartItems: PromoCartItem[] = cart.items.map((item) => ({
        productId: item.productId,
        isService: item.isService,
        subtotal: item.unitPrice * item.quantity,
      }));

      const result = await this.promoService.validate(code.trim().toUpperCase(), cartItems);
      return res.status(200).json(result);
    } catch (error) {
      return this.handleError(res, error, "Erreur lors de l'application du code promo");
    }
  }

  private getUserId(req: Request, res: Response): string | null {
    const userIdHeader = req.headers['x-user-id'];
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ message: 'Non autorisé' });
      return null;
    }

    return userId;
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
