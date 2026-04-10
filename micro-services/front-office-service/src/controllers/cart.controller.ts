import { Request, Response } from 'express';
import { HttpError } from '../common/HttpError';
import { Logger } from '../common/logger';
import { ICartService } from '../interfaces/CartService';

export class CartController {
  constructor(private readonly cartService: ICartService) { }

  async getCart(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const cart = await this.cartService.getCart(userId);
      return res.status(200).json(cart);
    } catch (error) {
      return this.handleError(res, error, 'Erreur lors de la récupération du panier');
    }
  }

  async addToCart(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const productId = req.body.productId as string;
      const quantity = Number(req.body.quantity);
      const period = req.body.period !== undefined ? Number(req.body.period) : undefined;

      if (!productId) {
        return res.status(422).json({ message: 'Le champ productId est requis' });
      }

      if (isNaN(quantity)) {
        return res.status(422).json({ message: 'La quantité est invalide' });
      }

      const item = await this.cartService.addToCart(userId, productId, quantity, period);
      return res.status(201).json(item);
    } catch (error) {
      return this.handleError(res, error, "Erreur lors de l'ajout au panier");
    }
  }

  async removeFromCart(req: Request<{ itemId: string }>, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const { itemId } = req.params;
      await this.cartService.removeFromCart(userId, itemId);
      return res.status(200).json({ message: 'Article supprimé avec succès' });
    } catch (error) {
      return this.handleError(res, error, "Erreur lors de la suppression de l'article");
    }
  }

  async updateCartItem(req: Request<{ itemId: string }>, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const { itemId } = req.params;
      const quantity = Number(req.body.quantity);

      if (isNaN(quantity)) {
        return res.status(422).json({ message: 'Une quantité valide est requise' });
      }

      const item = await this.cartService.updateCartItem(userId, itemId, quantity);
      return res.status(200).json(item);
    } catch (error) {
      return this.handleError(res, error, "Erreur lors de la mise à jour de l'article");
    }
  }

  async clearCart(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      await this.cartService.clearCart(userId);
      return res.status(200).json({ message: 'Panier vidé avec succès' });
    } catch (error) {
      return this.handleError(res, error, 'Erreur lors du vidage du panier');
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
      message: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
