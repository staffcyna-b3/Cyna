import { HttpError } from '../common/httpError';
import { IPromoService, PromoCartItem } from '../interfaces/IPromoService';
import { PromoValidationResponse } from '../dto/response/PromoValidationResponse';
import Promotion from '../models/Promotion';
import Product from '../models/Product';
import { PromotionType } from '../enum/PromotionType';

export class PromoService implements IPromoService {
  async validate(code: string, cartItems: PromoCartItem[]): Promise<PromoValidationResponse> {
    const promotion = await Promotion.findOne({
      where: { code, active: true },
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
    });

    if (!promotion) {
      throw new HttpError(404, 'Code promotionnel invalide ou inactif');
    }

    const eligibleProductIds = new Set(
      (promotion as unknown as { products: { id: string }[] }).products.map((p) => p.id)
    );

    const eligibleItems = cartItems.filter((item) => {
      const matchesType =
        promotion.discount_type === PromotionType.SERVICE ? item.isService : !item.isService;
      return matchesType && eligibleProductIds.has(item.productId);
    });

    if (eligibleItems.length === 0) {
      throw new HttpError(422, "Ce code promotionnel ne s'applique à aucun article de votre panier");
    }

    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = Number(
      (eligibleSubtotal * (Number(promotion.discount_value) / 100)).toFixed(2)
    );
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountedTotal = Number((totalAmount - discountAmount).toFixed(2));

    return {
      valid: true,
      promoCode: promotion.code,
      discountAmount,
      discountedTotal,
    };
  }
}
