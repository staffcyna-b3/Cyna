import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' });
export const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
