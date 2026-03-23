import React, { createContext, useContext } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';

interface StripeContextValue {
  stripePromise: Promise<Stripe | null> | null;
  isConfigured: boolean;
}

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const StripeContext = createContext<StripeContextValue>({
  stripePromise,
  isConfigured: Boolean(publishableKey),
});

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StripeContext.Provider
      value={{
        stripePromise,
        isConfigured: Boolean(publishableKey),
      }}
    >
      {children}
    </StripeContext.Provider>
  );
};

export const useStripeConfig = (): StripeContextValue => useContext(StripeContext);

export { stripePromise };
