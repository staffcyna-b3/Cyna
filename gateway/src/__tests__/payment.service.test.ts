import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../config/stripe.config', () => ({
  stripe: {
    paymentIntents: { create: vi.fn(), retrieve: vi.fn() },
    subscriptions: { create: vi.fn(), update: vi.fn() },
    products:       { create: vi.fn() },
    invoiceItems:   { create: vi.fn() },
    invoices:       { pay: vi.fn() },
    customers:      { create: vi.fn(), retrieve: vi.fn() },
  },
  stripeWebhookSecret: 'whsec_test',
}));

vi.mock('axios', () => ({ default: { post: vi.fn(), patch: vi.fn() } }));

vi.mock('../common/logger', () => ({
  Logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../config/microService.config', () => ({
  MICROSERVICES: {
    PRODUCT:     { url: 'http://product-service' },
    FRONTOFFICE: { url: 'http://front-office-service' },
  },
}));

// ── Imports (après les mocks) ─────────────────────────────────────────────────

import { PaymentService } from '../services/payment.service';
import { stripe } from '../config/stripe.config';
import type { IOrderRepository } from '../interfaces/IOrderRepository';
import type { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';
import type { SubscriptionItem } from '../interfaces/SubscriptionItem.interface';
import axios from 'axios';

// ── Factories ─────────────────────────────────────────────────────────────────

const makeOrderRepo = (): IOrderRepository => ({
  create:                          vi.fn().mockResolvedValue(undefined),
  findByPaymentIntentId:           vi.fn().mockResolvedValue(null),
  updateStatusByPaymentIntentId:   vi.fn().mockResolvedValue(undefined),
});

const makeUserRepo = (): IPaymentUserRepository => ({
  findStripeCustomerId:    vi.fn().mockResolvedValue(null),
  updateStripeCustomerId:  vi.fn().mockResolvedValue(undefined),
  findEmailById:           vi.fn().mockResolvedValue(null),
});

const makeMailService = () => ({
  sendConfirmationEmail:       vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail:      vi.fn().mockResolvedValue(undefined),
  send2FACode:                 vi.fn().mockResolvedValue(undefined),
  sendOrderConfirmationEmail:  vi.fn().mockResolvedValue(undefined),
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentService', () => {
  let service: PaymentService;
  let orderRepo: IOrderRepository;
  let userRepo: IPaymentUserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    orderRepo = makeOrderRepo();
    userRepo  = makeUserRepo();
    service   = new PaymentService(orderRepo, userRepo, makeMailService());
  });

  // ── createPaymentIntent ───────────────────────────────────────────────────

  describe('createPaymentIntent', () => {
    const mockIntent = {
      id:            'pi_test_abc123',
      client_secret: 'pi_test_abc123_secret_xyz',
      amount:        481500,
      currency:      'eur',
      status:        'requires_payment_method',
    };

    it('crée un PaymentIntent Stripe et enregistre la commande via le repository', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockIntent as any);

      const result = await service.createPaymentIntent(481500, 'eur', 'user-123', 'Commande test');

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount:      481500,
          currency:    'eur',
          description: 'Commande test',
          metadata:    { userId: 'user-123' },
        })
      );

      expect(orderRepo.create).toHaveBeenCalledWith({
        user_id:                  'user-123',
        total_amount:             4815,
        stripe_payment_intent_id: 'pi_test_abc123',
        payment_type:             'one_time',
        status:                   'pending',
      });

      expect(result).toEqual({
        clientSecret:    'pi_test_abc123_secret_xyz',
        paymentIntentId: 'pi_test_abc123',
      });
    });

    it('normalise un montant décimal (19.99 → 1999 centimes)', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({ ...mockIntent, amount: 1999 } as any);

      await service.createPaymentIntent(19.99, 'eur', 'user-123');

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1999 })
      );
    });

    it('normalise la devise en minuscules', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockIntent as any);

      await service.createPaymentIntent(1000, 'EUR', 'user-123');

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'eur' })
      );
    });

    it('lève INVALID_AMOUNT si le montant est négatif', async () => {
      await expect(service.createPaymentIntent(-100, 'eur', 'user-123')).rejects.toMatchObject({
        code: 'INVALID_AMOUNT',
      });
      expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('lève INVALID_AMOUNT si le montant est zéro', async () => {
      await expect(service.createPaymentIntent(0, 'eur', 'user-123')).rejects.toMatchObject({
        code: 'INVALID_AMOUNT',
      });
    });

    it('lève INVALID_CURRENCY si la devise est vide', async () => {
      await expect(service.createPaymentIntent(1000, '', 'user-123')).rejects.toMatchObject({
        code: 'INVALID_CURRENCY',
      });
    });

    it('lève STRIPE_CLIENT_SECRET_MISSING si Stripe ne retourne pas de clientSecret', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        ...mockIntent, client_secret: null,
      } as any);

      await expect(service.createPaymentIntent(1000, 'eur', 'user-123')).rejects.toMatchObject({
        code: 'STRIPE_CLIENT_SECRET_MISSING',
      });
      expect(orderRepo.create).not.toHaveBeenCalled();
    });
  });

  // ── retrievePaymentIntent ─────────────────────────────────────────────────

  describe('retrievePaymentIntent', () => {
    it('récupère l\'intent Stripe et met à jour le statut via le repository', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id:       'pi_test_abc123',
        status:   'succeeded',
        amount:   481500,
        currency: 'eur',
        metadata: { userId: 'user-123' },
      } as any);

      const result = await service.retrievePaymentIntent('pi_test_abc123', 'user-123');

      expect(orderRepo.updateStatusByPaymentIntentId).toHaveBeenCalledWith(
        'pi_test_abc123', 'success'
      );
      expect(result).toEqual({ status: 'succeeded', amount: 481500, currency: 'eur' });
    });

    it('lève FORBIDDEN si l\'intent appartient à un autre utilisateur', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id:       'pi_test_abc123',
        status:   'succeeded',
        amount:   481500,
        currency: 'eur',
        metadata: { userId: 'autre-user' },
      } as any);

      await expect(
        service.retrievePaymentIntent('pi_test_abc123', 'user-123')
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
    });
  });

  // ── createSubscription ────────────────────────────────────────────────────

  describe('createSubscription', () => {
    const items: SubscriptionItem[] = [
      {
        productId:        'prod-uuid-001',
        priceAmountCents: 14999,
        currency:         'eur',
        description:      'Cyna Pro',
        billingPeriod:    'monthly',
        quantity:         1,
      },
    ];

    const mockCustomer     = { id: 'cus_test_001', deleted: false };
    const mockProduct      = { id: 'prod_stripe_001' };
    const mockSubscription = {
      id:             'sub_test_001',
      status:         'incomplete',
      latest_invoice: { id: 'in_test_001', amount_due: 14999, status: 'open' },
      items:          {
        data: [{ current_period_start: 1700000000, current_period_end: 1702592000 }],
      },
    };
    const mockPi = { id: 'pi_sub_001', client_secret: 'pi_sub_001_secret' };

    beforeEach(() => {
      vi.mocked(userRepo.findStripeCustomerId).mockResolvedValue(null);
      vi.mocked(stripe.customers.create).mockResolvedValue(mockCustomer as any);
      vi.mocked(stripe.products.create).mockResolvedValue(mockProduct as any);
      vi.mocked(stripe.subscriptions.create).mockResolvedValue(mockSubscription as any);
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockPi as any);
      vi.mocked(axios.post).mockResolvedValue({ data: {} });
    });

    it('retourne clientSecret, subscriptionId et paymentIntentId', async () => {
      const result = await service.createSubscription(
        items, 0, undefined, 'user-123', 'user@test.fr'
      );

      expect(result).toEqual({
        clientSecret:    'pi_sub_001_secret',
        subscriptionId:  'sub_test_001',
        paymentIntentId: 'pi_sub_001',
      });
    });

    it('crée un customer Stripe et l\'enregistre via le repository', async () => {
      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(stripe.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@test.fr', metadata: { userId: 'user-123' } })
      );
      expect(userRepo.updateStripeCustomerId).toHaveBeenCalledWith('user-123', 'cus_test_001');
    });

    it('réutilise un customer Stripe existant', async () => {
      vi.mocked(userRepo.findStripeCustomerId).mockResolvedValue('cus_existing_001');
      vi.mocked(stripe.customers.retrieve).mockResolvedValue({ id: 'cus_existing_001', deleted: false } as any);

      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(stripe.customers.create).not.toHaveBeenCalled();
    });

    it('ajoute un invoiceItem pour les achats one-time', async () => {
      vi.mocked(stripe.invoiceItems?.create ?? vi.fn()).mockResolvedValue({} as any);

      await service.createSubscription(
        items, 5000, 'Frais de setup', 'user-123', 'user@test.fr'
      );

      expect(stripe.invoiceItems.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 5000, customer: 'cus_test_001' })
      );
    });

    it('enregistre la commande en base avec payment_type subscription', async () => {
      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id:       'user-123',
          payment_type:  'subscription',
          status:        'pending',
          stripe_payment_intent_id: 'pi_sub_001',
        })
      );
    });
  });

  // ── handleStripeEvent ─────────────────────────────────────────────────────

  describe('handleStripeEvent', () => {
    // ── payment_intent.succeeded ────────────────────────────────────────────

    it('passe le statut à "success" sur payment_intent.succeeded', async () => {
      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id:   'evt_succeeded',
        data: {
          object: {
            id:       'pi_test_abc123',
            amount:   481500,
            currency: 'eur',
            metadata: { userId: 'user-123' },
          },
        },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).toHaveBeenCalledWith(
        'pi_test_abc123', 'success'
      );
    });

    it('ignore un payment_intent.succeeded déjà traité (idempotence)', async () => {
      vi.mocked(orderRepo.findByPaymentIntentId).mockResolvedValue({ status: 'success' });

      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id:   'evt_duplicate',
        data: { object: { id: 'pi_test_abc123', metadata: {} } },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
    });

    it('active la subscription via invoices.pay si invoiceId est dans les metadata', async () => {
      vi.mocked(stripe.subscriptions.update).mockResolvedValue({} as any);
      vi.mocked(stripe.invoices.pay).mockResolvedValue({} as any);

      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id:   'evt_sub_succeeded',
        data: {
          object: {
            id:             'pi_sub_001',
            amount:         14999,
            currency:       'eur',
            payment_method: 'pm_test_card',
            metadata: {
              userId:         'user-123',
              subscriptionId: 'sub_test_001',
              invoiceId:      'in_test_001',
            },
          },
        },
      } as any);

      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test_001', { default_payment_method: 'pm_test_card' }
      );
      expect(stripe.invoices.pay).toHaveBeenCalledWith(
        'in_test_001', { paid_out_of_band: true }
      );
    });

    // ── payment_intent.payment_failed ───────────────────────────────────────

    it('passe le statut à "error" sur payment_intent.payment_failed', async () => {
      await service.handleStripeEvent({
        type: 'payment_intent.payment_failed',
        id:   'evt_failed',
        data: {
          object: {
            id:       'pi_test_def456',
            amount:   1000,
            currency: 'eur',
            metadata: { userId: 'user-123' },
          },
        },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).toHaveBeenCalledWith(
        'pi_test_def456', 'error'
      );
    });

    it('ignore un payment_intent.payment_failed déjà traité (idempotence)', async () => {
      vi.mocked(orderRepo.findByPaymentIntentId).mockResolvedValue({ status: 'error' });

      await service.handleStripeEvent({
        type: 'payment_intent.payment_failed',
        id:   'evt_duplicate_failed',
        data: { object: { id: 'pi_test_def456', metadata: {} } },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
    });

    // ── invoice.payment_succeeded ───────────────────────────────────────────

    it('notifie le front-office "active" sur invoice.payment_succeeded', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: {} });

      await service.handleStripeEvent({
        type: 'invoice.payment_succeeded',
        id:   'evt_inv_ok',
        data: {
          object: {
            id:     'in_test_001',
            status: 'paid',
            parent: {
              type:                 'subscription_details',
              subscription_details: { subscription: 'sub_test_001' },
            },
          },
        },
      } as any);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/status'),
        expect.objectContaining({ stripeSubscriptionId: 'sub_test_001', status: 'active' }),
        expect.anything()
      );
    });

    // ── invoice.payment_failed ──────────────────────────────────────────────

    it('notifie le front-office "inactive" sur invoice.payment_failed', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: {} });

      await service.handleStripeEvent({
        type: 'invoice.payment_failed',
        id:   'evt_inv_failed',
        data: {
          object: {
            id:     'in_test_002',
            status: 'open',
            parent: {
              type:                 'subscription_details',
              subscription_details: { subscription: 'sub_test_001' },
            },
          },
        },
      } as any);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/status'),
        expect.objectContaining({ stripeSubscriptionId: 'sub_test_001', status: 'inactive' }),
        expect.anything()
      );
    });

    // ── customer.subscription.deleted ───────────────────────────────────────

    it('notifie le front-office "cancelled" sur customer.subscription.deleted', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: {} });

      await service.handleStripeEvent({
        type: 'customer.subscription.deleted',
        id:   'evt_sub_deleted',
        data: {
          object: {
            id:     'sub_test_001',
            status: 'canceled',
          },
        },
      } as any);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/status'),
        expect.objectContaining({ stripeSubscriptionId: 'sub_test_001', status: 'cancelled' }),
        expect.anything()
      );
    });

    // ── événement inconnu ───────────────────────────────────────────────────

    it('ignore les événements inconnus sans toucher la base', async () => {
      await service.handleStripeEvent({
        type: 'customer.created',
        id:   'evt_unknown',
        data: { object: {} },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
    });
  });
});
