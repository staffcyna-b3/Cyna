import { Stripe } from "@stripe/stripe-js";

export interface StripeContextValue {
  stripePromise: Promise<Stripe | null> | null;
  isConfigured: boolean;
}