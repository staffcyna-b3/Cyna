import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createStripeWebhookRouter } from '../routes/stripeWebhook';
import type { IStripeClient } from '../interfaces/IStripeClient';

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = 'whsec_test_secret';

const MOCK_EVENT = {
  id:      'evt_test_001',
  type:    'payment_intent.succeeded',
  data:    { object: { id: 'pi_test_001', metadata: {} } },
};

const buildApp = (stripeClient: Pick<IStripeClient, 'webhooks'>, webhookService: any) => {
  const app = express();
  // No express.json() here — raw parsing is handled inside the router
  const router = createStripeWebhookRouter(stripeClient as IStripeClient, webhookService, WEBHOOK_SECRET);
  app.use('/webhook', router);
  return app;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /webhook/stripe', () => {
  const mockWebhookService = { handleStripeEvent: vi.fn() };
  const mockStripeClient = { webhooks: { constructEvent: vi.fn() } };

  beforeEach(() => vi.clearAllMocks());

  // ── Signature valide ──────────────────────────────────────────────────────

  it('retourne 200 et appelle handleStripeEvent si la signature est valide', async () => {
    mockStripeClient.webhooks.constructEvent.mockReturnValue(MOCK_EVENT);
    mockWebhookService.handleStripeEvent.mockResolvedValue(undefined);

    const app = buildApp(mockStripeClient as any, mockWebhookService);

    const res = await request(app)
      .post('/webhook/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=1234,v1=abcdef')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(mockStripeClient.webhooks.constructEvent).toHaveBeenCalledOnce();
    expect(mockWebhookService.handleStripeEvent).toHaveBeenCalledWith(MOCK_EVENT);
  });

  // ── Signature invalide ────────────────────────────────────────────────────

  it('retourne 400 INVALID_STRIPE_SIGNATURE si constructEvent lève une erreur', async () => {
    mockStripeClient.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload');
    });

    const app = buildApp(mockStripeClient as any, mockWebhookService);

    const res = await request(app)
      .post('/webhook/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=1234,v1=invalide')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_STRIPE_SIGNATURE');
    expect(res.body.message).toContain('No signatures found');
    expect(mockWebhookService.handleStripeEvent).not.toHaveBeenCalled();
  });

  // ── Header absent ─────────────────────────────────────────────────────────

  it('retourne 400 MISSING_SIGNATURE si le header stripe-signature est absent', async () => {
    const app = buildApp(mockStripeClient as any, mockWebhookService);

    const res = await request(app)
      .post('/webhook/stripe')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('MISSING_SIGNATURE');
    expect(mockStripeClient.webhooks.constructEvent).not.toHaveBeenCalled();
    expect(mockWebhookService.handleStripeEvent).not.toHaveBeenCalled();
  });

  // ── Erreur dans handleStripeEvent ─────────────────────────────────────────

  it('retourne 400 si handleStripeEvent lève une exception inattendue', async () => {
    mockStripeClient.webhooks.constructEvent.mockReturnValue(MOCK_EVENT);
    mockWebhookService.handleStripeEvent.mockRejectedValue(new Error('DB connection lost'));

    const app = buildApp(mockStripeClient as any, mockWebhookService);

    const res = await request(app)
      .post('/webhook/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=1234,v1=abcdef')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_STRIPE_SIGNATURE');
  });
});
