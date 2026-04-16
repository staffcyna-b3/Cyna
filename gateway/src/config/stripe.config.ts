// TODO: migré vers payments-service — à supprimer après validation
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' });

const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error('STRIPE_PUBLISHABLE_KEY is not defined');
}
export { stripePublishableKey };

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeWebhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
}
export { stripeWebhookSecret };
