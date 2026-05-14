import { IPromoRepository, PromotionWithProducts } from '../interfaces/IPromoRepository';
import Promotion from '../models/Promotion';
import Product from '../models/Product';

export class PromoRepository implements IPromoRepository {
  async findByCode(code: string): Promise<PromotionWithProducts | null> {
    const promotion = await Promotion.findOne({
      where: { code, active: true },
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
    });

    if (!promotion) return null;

    return {
      id: promotion.id,
      code: promotion.code,
      discount_type: promotion.discount_type,
      discount_value: Number(promotion.discount_value),
      active: promotion.active,
      products: (promotion as unknown as { products: { id: string }[] }).products,
    };
  }
}
