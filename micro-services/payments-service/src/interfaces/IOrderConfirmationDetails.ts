export interface IOrderConfirmationDetails {
  amountCents: number;
  currency: string;
  paymentIntentId: string;
  paymentType: 'one_time' | 'subscription';
}
