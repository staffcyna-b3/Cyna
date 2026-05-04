import { PromotionType } from '../enum/PromotionType';

export interface PromotionWithProducts {
  id: string;
  code: string;
  discount_type: PromotionType;
  discount_value: number;
  active: boolean;
  products: { id: string }[];
}

export interface IPromoRepository {
  findByCode(code: string): Promise<PromotionWithProducts | null>;
}
