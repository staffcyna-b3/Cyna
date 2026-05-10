export interface PromoValidationResponse {
  valid: boolean;
  promoCode: string;
  discountAmount: number;
  discountedTotal: number;
}
