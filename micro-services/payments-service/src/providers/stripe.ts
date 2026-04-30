import Stripe from 'stripe';

const _stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!_stripeSecretKey) throw new Error('STRIPE_SECRET_KEY is not defined');
export const stripe = new Stripe(_stripeSecretKey, { apiVersion: '2025-02-24.acacia' });

const _stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
if (!_stripePublishableKey) throw new Error('STRIPE_PUBLISHABLE_KEY is not defined');
export const stripePublishableKey: string = _stripePublishableKey;

const _stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!_stripeWebhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
export const stripeWebhookSecret: string = _stripeWebhookSecret;
