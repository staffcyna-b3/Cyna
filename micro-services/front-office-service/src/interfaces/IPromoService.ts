import { PromoValidationResponse } from '../dto/response/PromoValidationResponse';

export interface PromoCartItem {
  productId: string;
  isService: boolean;
  subtotal: number;
}

export interface IPromoService {
  validate(code: string, cartItems: PromoCartItem[]): Promise<PromoValidationResponse>;
}
