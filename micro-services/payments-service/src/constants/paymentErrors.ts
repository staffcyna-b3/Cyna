export const PAYMENT_ERRORS = {
  INVALID_AMOUNT: {
    status: 400,
    code: 'INVALID_AMOUNT',
    message: 'Le montant doit être un nombre strictement positif',
  },
  INVALID_CURRENCY: {
    status: 400,
    code: 'INVALID_CURRENCY',
    message: 'Devise invalide',
  },
  CLIENT_SECRET_MISSING: {
    status: 500,
    code: 'STRIPE_CLIENT_SECRET_MISSING',
    message: "Stripe n'a pas retourné de clientSecret",
  },
  FORBIDDEN: {
    status: 403,
    code: 'FORBIDDEN',
    message: "Vous n'êtes pas autorisé à consulter ce paiement",
  },
  CARD_ERROR: (message: string) => ({
    status: 402,
    code: 'CARD_ERROR',
    message,
  }),
  STRIPE_INVALID_REQUEST: (message: string) => ({
    status: 400,
    code: 'STRIPE_INVALID_REQUEST',
    message,
  }),
};
