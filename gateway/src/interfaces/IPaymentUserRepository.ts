// TODO: migré vers payments-service — à supprimer après validation
export interface IPaymentUserRepository {
  findStripeCustomerId(userId: string): Promise<string | null>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<void>;
  findEmailById(userId: string): Promise<string | null>;
}
