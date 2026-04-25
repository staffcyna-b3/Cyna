import { CheckoutContextResponse } from '../dto/response/CheckoutContextResponse';

export interface ICheckoutService {
  getCheckoutContext(userId: string): Promise<CheckoutContextResponse>;
}