import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { PaymentController } from '../controllers/payment.controller';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Construit une app Express isolée avec un utilisateur simulé en req.user */
const buildApp = (controller: PaymentController, authenticatedUserId?: string) => {
  const app = express();
  app.use(express.json());

  if (authenticatedUserId) {
    app.use((req, _res, next) => {
      (req as any).user = { userId: authenticatedUserId };
      next();
    });
  }

  app.post('/create-intent',        (req, res, next) => controller.createIntent(req, res, next));
  app.post('/create-subscription',  (req, res, next) => controller.createSubscription(req, res, next));
  app.get('/intent/:id',            (req, res, next) => controller.getIntent(req, res, next));

  return app;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PaymentController', () => {
  const mockService = {
    createPaymentIntent:  vi.fn(),
    retrievePaymentIntent: vi.fn(),
    createSubscription:   vi.fn(),
    handleStripeEvent:    vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  // ── POST /create-intent ───────────────────────────────────────────────────

  describe('POST /create-intent', () => {
    it('retourne 201 avec clientSecret et paymentIntentId', async () => {
      mockService.createPaymentIntent.mockResolvedValue({
        clientSecret:    'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      });

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 481500, currency: 'eur', userId: 'user-abc' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        clientSecret:    'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      });
      expect(mockService.createPaymentIntent).toHaveBeenCalledWith(
        481500, 'eur', 'user-abc', undefined
      );
    });

    it('retourne 201 même sans userId dans le body (utilise celui du token)', async () => {
      mockService.createPaymentIntent.mockResolvedValue({
        clientSecret:    'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      });

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 481500, currency: 'eur' });

      expect(res.status).toBe(201);
    });

    it('retourne 401 si req.user est absent (non authentifié)', async () => {
      const app = buildApp(new PaymentController(mockService as any));

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 1000, currency: 'eur' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
      expect(mockService.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('retourne 403 si le userId du body ne correspond pas au token', async () => {
      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 1000, currency: 'eur', userId: 'autre-user' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
      expect(mockService.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('propage l\'erreur au handler Express si le service lève une exception', async () => {
      mockService.createPaymentIntent.mockRejectedValue(new Error('Stripe KO'));

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');
      app.use((err: any, _req: any, res: any, _next: any) => {
        res.status(500).json({ error: err.message });
      });

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 1000, currency: 'eur' });

      expect(res.status).toBe(500);
    });
  });

  // ── POST /create-subscription ─────────────────────────────────────────────

  describe('POST /create-subscription', () => {
    const validBody = {
      subscriptionItems: [
        {
          productId:        'prod-uuid-001',
          priceAmountCents: 14999,
          currency:         'eur',
          description:      'Cyna Pro',
          billingPeriod:    'monthly',
          quantity:         1,
        },
      ],
      userEmail: 'test@cyna.fr',
    };

    it('retourne 201 avec clientSecret, subscriptionId et paymentIntentId', async () => {
      mockService.createSubscription.mockResolvedValue({
        clientSecret:    'pi_sub_secret',
        subscriptionId:  'sub_test_001',
        paymentIntentId: 'pi_sub_001',
      });

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const res = await request(app).post('/create-subscription').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        clientSecret:    'pi_sub_secret',
        subscriptionId:  'sub_test_001',
        paymentIntentId: 'pi_sub_001',
      });
      expect(mockService.createSubscription).toHaveBeenCalledWith(
        validBody.subscriptionItems,
        0,
        undefined,
        'user-abc',
        'test@cyna.fr'
      );
    });

    it('transmet oneTimeAmountCents et oneTimeDescription au service', async () => {
      mockService.createSubscription.mockResolvedValue({
        clientSecret: 'pi_sub_secret', subscriptionId: 'sub_test_001', paymentIntentId: 'pi_sub_001',
      });

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      await request(app).post('/create-subscription').send({
        ...validBody,
        oneTimeAmountCents: 5000,
        oneTimeDescription: 'Frais de setup',
      });

      expect(mockService.createSubscription).toHaveBeenCalledWith(
        expect.anything(), 5000, 'Frais de setup', 'user-abc', 'test@cyna.fr'
      );
    });

    it('retourne 401 si req.user est absent', async () => {
      const app = buildApp(new PaymentController(mockService as any));

      const res = await request(app).post('/create-subscription').send(validBody);

      expect(res.status).toBe(401);
      expect(mockService.createSubscription).not.toHaveBeenCalled();
    });

    it('retourne 400 si subscriptionItems est vide', async () => {
      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const res = await request(app)
        .post('/create-subscription')
        .send({ ...validBody, subscriptionItems: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('MISSING_SUBSCRIPTION_ITEMS');
      expect(mockService.createSubscription).not.toHaveBeenCalled();
    });

    it('retourne 400 si subscriptionItems est absent', async () => {
      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const { subscriptionItems: _, ...bodyWithoutItems } = validBody;
      const res = await request(app)
        .post('/create-subscription')
        .send(bodyWithoutItems);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('MISSING_SUBSCRIPTION_ITEMS');
    });

    it('retourne 400 si userEmail est absent', async () => {
      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const { userEmail: _, ...bodyWithoutEmail } = validBody;
      const res = await request(app)
        .post('/create-subscription')
        .send(bodyWithoutEmail);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('MISSING_EMAIL');
      expect(mockService.createSubscription).not.toHaveBeenCalled();
    });

    it('propage l\'erreur au handler Express si le service lève une exception', async () => {
      mockService.createSubscription.mockRejectedValue(new Error('Stripe KO'));

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');
      app.use((err: any, _req: any, res: any, _next: any) => {
        res.status(500).json({ error: err.message });
      });

      const res = await request(app).post('/create-subscription').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  // ── GET /intent/:id ───────────────────────────────────────────────────────

  describe('GET /intent/:id', () => {
    it('retourne 200 et passe l\'userId authentifié au service', async () => {
      mockService.retrievePaymentIntent.mockResolvedValue({
        status:   'succeeded',
        amount:   481500,
        currency: 'eur',
      });

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');

      const res = await request(app).get('/intent/pi_test_abc123');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'succeeded', amount: 481500, currency: 'eur' });
      expect(mockService.retrievePaymentIntent).toHaveBeenCalledWith('pi_test_abc123', 'user-abc');
    });

    it('retourne 401 si req.user est absent', async () => {
      const app = buildApp(new PaymentController(mockService as any));

      const res = await request(app).get('/intent/pi_test_abc123');

      expect(res.status).toBe(401);
      expect(mockService.retrievePaymentIntent).not.toHaveBeenCalled();
    });

    it('propage l\'erreur au handler Express si le service lève une exception', async () => {
      mockService.retrievePaymentIntent.mockRejectedValue(new Error('Intent introuvable'));

      const app = buildApp(new PaymentController(mockService as any), 'user-abc');
      app.use((err: any, _req: any, res: any, _next: any) => {
        res.status(500).json({ error: err.message });
      });

      const res = await request(app).get('/intent/pi_inexistant');

      expect(res.status).toBe(500);
    });
  });
});
