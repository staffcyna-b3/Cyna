import { HttpError } from '../common/httpError';
import { IPromoService, PromoCartItem } from '../interfaces/IPromoService';
import { IPromoRepository } from '../interfaces/IPromoRepository';
import { ICartService } from '../interfaces/CartService';
import { PromoValidationResponse } from '../dto/response/PromoValidationResponse';

export class PromoService implements IPromoService {
  constructor(
    private readonly promoRepository: IPromoRepository,
    private readonly cartService: ICartService,
  ) {}

  async validate(code: string, cartItems: PromoCartItem[]): Promise<PromoValidationResponse> {
    const promotion = await this.promoRepository.findByCode(code);

    if (!promotion) {
      throw new HttpError(404, 'Code promotionnel invalide ou inactif');
    }

    // Une promo liée à des produits spécifiques est une réduction automatique, pas un code promo manuel
    if (promotion.products.length > 0) {
      throw new HttpError(422, 'Code promotionnel invalide');
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = Number((totalAmount * (promotion.discount_value / 100)).toFixed(2));
    const discountedTotal = Number((totalAmount - discountAmount).toFixed(2));

    return {
      valid: true,
      promoCode: promotion.code,
      discountAmount,
      discountedTotal,
    };
  }

  async validateForCart(userId: string, code: string): Promise<PromoValidationResponse> {
    if (!code) {
      throw new HttpError(422, 'Le champ code est requis');
    }

    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      throw new HttpError(422, 'Votre panier est vide');
    }

    const cartItems: PromoCartItem[] = cart.items.map((item) => ({
      productId: item.productId,
      isService: item.isService,
      subtotal: (item.discountedUnitPrice ?? item.unitPrice) * item.quantity,
    }));

    return this.validate(code, cartItems);
  }
}
