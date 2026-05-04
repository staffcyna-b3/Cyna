import { AppError } from '../errors/AppError';

export const PAYMENT_ERRORS = {
  INVALID_AMOUNT: () =>
    new AppError(400, 'INVALID_AMOUNT', 'Le montant doit être un nombre strictement positif'),

  INVALID_CURRENCY: () =>
    new AppError(400, 'INVALID_CURRENCY', 'Devise invalide'),

  CLIENT_SECRET_MISSING: () =>
    new AppError(500, 'STRIPE_CLIENT_SECRET_MISSING', "Stripe n'a pas retourné de clientSecret"),

  FORBIDDEN: () =>
    new AppError(403, 'FORBIDDEN', "Vous n'êtes pas autorisé à consulter ce paiement"),

  CARD_ERROR: (message: string) =>
    new AppError(402, 'CARD_ERROR', message),

  STRIPE_INVALID_REQUEST: (message: string) =>
    new AppError(400, 'STRIPE_INVALID_REQUEST', message),
};
