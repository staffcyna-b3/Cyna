import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { requireAuth } from '../middlewares/requireAuth.middleware';
import { errorMiddleware } from '../middlewares/error.middleware';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_USER = { userId: 'user-abc', email: 'test@example.com' };

/**
 * buildApp — monte une app Express isolée pour tester le controller.
 * - injectUser: simule un utilisateur déjà authentifié (gateway a positionné req.user)
 * - useRequireAuth: monte le vrai middleware requireAuth pour tester les 401
 */
const buildApp = (
  paymentIntentService: any,
  subscriptionService: any,
  opts: { injectUser?: typeof DEFAULT_USER; useRequireAuth?: boolean } = {}
) => {
  const app = express();
  app.use(express.json());

  if (opts.useRequireAuth) {
    app.use(requireAuth);
  } else if (opts.injectUser) {
    app.use((req, _res, next) => {
      (req as any).user = opts.injectUser;
      next();
    });
  }

  const controller = new PaymentController(paymentIntentService, subscriptionService);
  app.post('/create-intent',       (req, res, next) => controller.createIntent(req, res, next));
  app.post('/create-subscription', (req, res, next) => controller.createSubscription(req, res, next));
  app.get('/intent/:id',           (req, res, next) => controller.getIntent(req, res, next));
  app.use(errorMiddleware);

  return app;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PaymentController', () => {
  const mockPaymentIntentService = {
    createPaymentIntent:   vi.fn(),
    retrievePaymentIntent: vi.fn(),
  };

  const mockSubscriptionService = {
    createSubscription: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  // ── POST /create-intent ───────────────────────────────────────────────────

  describe('POST /create-intent', () => {
    it('retourne 201 avec clientSecret et paymentIntentId', async () => {
      mockPaymentIntentService.createPaymentIntent.mockResolvedValue({
        clientSecret:    'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      });

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 481500, currency: 'eur' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        clientSecret:    'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      });
      expect(mockPaymentIntentService.createPaymentIntent).toHaveBeenCalledWith(
        481500, 'eur', 'user-abc', undefined, 'test@example.com'
      );
    });

    it('transmet la description facultative au service', async () => {
      mockPaymentIntentService.createPaymentIntent.mockResolvedValue({
        clientSecret: 'pi_test_secret', paymentIntentId: 'pi_test_123',
      });

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      await request(app)
        .post('/create-intent')
        .send({ amount: 481500, currency: 'eur', description: 'Achat test' });

      expect(mockPaymentIntentService.createPaymentIntent).toHaveBeenCalledWith(
        481500, 'eur', 'user-abc', 'Achat test', 'test@example.com'
      );
    });

    it('retourne 401 si les headers d\'authentification sont absents', async () => {
      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { useRequireAuth: true });

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: 1000, currency: 'eur' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
      expect(mockPaymentIntentService.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('propage l\'erreur au errorMiddleware si le service lève une AppError', async () => {
      const { AppError } = await import('../errors/AppError');
      mockPaymentIntentService.createPaymentIntent.mockRejectedValue(
        new AppError(400, 'INVALID_AMOUNT', 'Montant invalide')
      );

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      const res = await request(app)
        .post('/create-intent')
        .send({ amount: -1, currency: 'eur' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_AMOUNT');
    });
  });

  // ── POST /create-subscription ─────────────────────────────────────────────

  describe('POST /create-subscription', () => {
    const subscriptionItems = [
      {
        productId:        'prod-uuid-001',
        priceAmountCents: 14999,
        currency:         'eur',
        description:      'Cyna Pro',
        billingPeriod:    'monthly',
        quantity:         1,
        durationMonths:   3,
      },
    ];

    it('retourne 201 avec clientSecret, subscriptionId et paymentIntentId', async () => {
      mockSubscriptionService.createSubscription.mockResolvedValue({
        clientSecret:    'pi_sub_secret',
        subscriptionId:  'sub_test_001',
        paymentIntentId: 'pi_sub_001',
      });

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      const res = await request(app)
        .post('/create-subscription')
        .send({ subscriptionItems });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        clientSecret:    'pi_sub_secret',
        subscriptionId:  'sub_test_001',
        paymentIntentId: 'pi_sub_001',
      });
      expect(mockSubscriptionService.createSubscription).toHaveBeenCalledWith(
        subscriptionItems, 0, undefined, 'user-abc', 'test@example.com'
      );
    });

    it('transmet oneTimeAmountCents et oneTimeDescription au service', async () => {
      mockSubscriptionService.createSubscription.mockResolvedValue({
        clientSecret: 'pi_sub_secret', subscriptionId: 'sub_test_001', paymentIntentId: 'pi_sub_001',
      });

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      await request(app)
        .post('/create-subscription')
        .send({ subscriptionItems, oneTimeAmountCents: 5000, oneTimeDescription: 'Frais de setup' });

      expect(mockSubscriptionService.createSubscription).toHaveBeenCalledWith(
        subscriptionItems, 5000, 'Frais de setup', 'user-abc', 'test@example.com'
      );
    });

    it('retourne 401 si les headers d\'authentification sont absents', async () => {
      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { useRequireAuth: true });

      const res = await request(app)
        .post('/create-subscription')
        .send({ subscriptionItems });

      expect(res.status).toBe(401);
      expect(mockSubscriptionService.createSubscription).not.toHaveBeenCalled();
    });

    it('propage l\'erreur au errorMiddleware si le service lève une exception', async () => {
      mockSubscriptionService.createSubscription.mockRejectedValue(new Error('Stripe KO'));

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      const res = await request(app)
        .post('/create-subscription')
        .send({ subscriptionItems });

      expect(res.status).toBe(500);
    });
  });

  // ── GET /intent/:id ───────────────────────────────────────────────────────

  describe('GET /intent/:id', () => {
    it('retourne 200 avec le statut du PaymentIntent', async () => {
      mockPaymentIntentService.retrievePaymentIntent.mockResolvedValue({
        status:   'succeeded',
        amount:   481500,
        currency: 'eur',
      });

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      const res = await request(app).get('/intent/pi_test_abc123');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'succeeded', amount: 481500, currency: 'eur' });
      expect(mockPaymentIntentService.retrievePaymentIntent).toHaveBeenCalledWith('pi_test_abc123', 'user-abc');
    });

    it('retourne 401 si les headers d\'authentification sont absents', async () => {
      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { useRequireAuth: true });

      const res = await request(app).get('/intent/pi_test_abc123');

      expect(res.status).toBe(401);
      expect(mockPaymentIntentService.retrievePaymentIntent).not.toHaveBeenCalled();
    });

    it('propage l\'erreur au errorMiddleware si le service lève une AppError', async () => {
      const { AppError } = await import('../errors/AppError');
      mockPaymentIntentService.retrievePaymentIntent.mockRejectedValue(
        new AppError(403, 'FORBIDDEN', 'Accès interdit')
      );

      const app = buildApp(mockPaymentIntentService, mockSubscriptionService, { injectUser: DEFAULT_USER });

      const res = await request(app).get('/intent/pi_inexistant');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });
  });
});
