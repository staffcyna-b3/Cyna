import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { MICROSERVICES } from '../config/microService.config';

const target = MICROSERVICES.PAYMENTS.url;

/**
 * Proxy for payment API routes.
 * Mounted at /api/payments — Express strips that prefix, leaving e.g. /create-intent.
 * pathRewrite prepends /payments so payments-service receives /payments/create-intent.
 */
export const paymentsApiProxy = createProxyMiddleware({
  target: MICROSERVICES.PAYMENTS.url,
  changeOrigin: true,
  pathRewrite: async (path) => '/payments' + path,
  on: {
    proxyReq: fixRequestBody
  }
});

/**
 * Proxy for Stripe webhook.
 * Mounted at /webhooks — Express strips that prefix, leaving e.g. /stripe.
 * pathRewrite maps /stripe → /webhook/stripe so payments-service receives /webhook/stripe.
 */
export const paymentsWebhookProxy = createProxyMiddleware({
  target: MICROSERVICES.PAYMENTS.url,
  changeOrigin: true,
  pathRewrite: async (path) => '/webhook' + path,
});
