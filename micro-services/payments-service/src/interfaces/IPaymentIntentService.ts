export interface IPaymentIntentService {
  createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    description?: string,
    userEmail?: string
  ): Promise<{ clientSecret: string; paymentIntentId: string }>;

  retrievePaymentIntent(
    paymentIntentId: string,
    requestingUserId: string
  ): Promise<{ status: string; amount: number; currency: string }>;
}
