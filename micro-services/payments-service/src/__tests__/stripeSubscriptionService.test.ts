import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeSubscriptionService } from '../services/stripeSubscriptionService';
import type { IOrderRepository } from '../interfaces/IOrderRepository';
import type { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';
import type { IStripeClient } from '../interfaces/IStripeClient';
import type { IHttpClient } from '../interfaces/IHttpClient';
import type { SubscriptionItem } from '../interfaces/SubscriptionItem.interface';

// ── Factories ─────────────────────────────────────────────────────────────────

const makeStripeClient = (): IStripeClient => ({
  paymentIntents: { create: vi.fn(), retrieve: vi.fn() },
  invoiceItems:   { create: vi.fn() },
  products:       { create: vi.fn() },
  subscriptions:  { create: vi.fn(), update: vi.fn() },
  invoices:       { pay: vi.fn() },
  customers:      { create: vi.fn(), retrieve: vi.fn() },
  webhooks:       { constructEvent: vi.fn() },
});

const makeOrderRepo = (): IOrderRepository => ({
  create:                        vi.fn().mockResolvedValue(undefined),
  findByPaymentIntentId:         vi.fn().mockResolvedValue(null),
  updateStatusByPaymentIntentId: vi.fn().mockResolvedValue(undefined),
});

const makeUserRepo = (): IPaymentUserRepository => ({
  findStripeCustomerId:   vi.fn().mockResolvedValue(null),
  updateStripeCustomerId: vi.fn().mockResolvedValue(undefined),
  findEmailById:          vi.fn().mockResolvedValue(null),
});

const makeHttpClient = (): IHttpClient => ({
  post:  vi.fn().mockResolvedValue(undefined),
  patch: vi.fn().mockResolvedValue(undefined),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StripeSubscriptionService', () => {
  let service: StripeSubscriptionService;
  let stripeClient: IStripeClient;
  let orderRepo: IOrderRepository;
  let userRepo: IPaymentUserRepository;
  let httpClient: IHttpClient;

  const items: SubscriptionItem[] = [
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

  const mockCustomer     = { id: 'cus_test_001', deleted: false };
  const mockProduct      = { id: 'prod_stripe_001', name: 'Cyna Pro' };
  const mockSubscription = {
    id:             'sub_test_001',
    status:         'incomplete',
    cancel_at:      null,
    latest_invoice: { id: 'in_test_001', amount_due: 14999, status: 'open' },
    items: {
      data: [{ current_period_start: 1700000000, current_period_end: 1702592000 }],
    },
  };
  const mockPi = { id: 'pi_sub_001', client_secret: 'pi_sub_001_secret' };

  beforeEach(() => {
    vi.clearAllMocks();
    stripeClient = makeStripeClient();
    orderRepo    = makeOrderRepo();
    userRepo     = makeUserRepo();
    httpClient   = makeHttpClient();
    service      = new StripeSubscriptionService(orderRepo, userRepo, stripeClient, httpClient);

    vi.mocked(stripeClient.customers.create).mockResolvedValue(mockCustomer as any);
    vi.mocked(stripeClient.products.create).mockResolvedValue(mockProduct as any);
    vi.mocked(stripeClient.subscriptions.create).mockResolvedValue(mockSubscription as any);
    vi.mocked(stripeClient.paymentIntents.create).mockResolvedValue(mockPi as any);
  });

  // ── createSubscription ────────────────────────────────────────────────────

  describe('createSubscription', () => {
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

      expect(stripeClient.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@test.fr', metadata: { userId: 'user-123' } })
      );
      expect(userRepo.updateStripeCustomerId).toHaveBeenCalledWith('user-123', 'cus_test_001');
    });

    it('réutilise un customer Stripe existant', async () => {
      vi.mocked(userRepo.findStripeCustomerId).mockResolvedValue('cus_existing_001');
      vi.mocked(stripeClient.customers.retrieve).mockResolvedValue({ id: 'cus_existing_001', deleted: false } as any);

      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(stripeClient.customers.create).not.toHaveBeenCalled();
    });

    it('ajoute un invoiceItem pour les achats one-time', async () => {
      vi.mocked(stripeClient.invoiceItems.create).mockResolvedValue({} as any);

      await service.createSubscription(
        items, 5000, 'Frais de setup', 'user-123', 'user@test.fr'
      );

      expect(stripeClient.invoiceItems.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 5000, customer: 'cus_test_001' })
      );
    });

    it('enregistre la commande en base avec payment_type subscription', async () => {
      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id:                  'user-123',
          payment_type:             'subscription',
          status:                   'pending',
          stripe_payment_intent_id: 'pi_sub_001',
        })
      );
    });

    it('notifie le front-office de la création de l\'abonnement', async () => {
      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions'),
        expect.objectContaining({
          stripeSubscriptionId: 'sub_test_001',
          userId: 'user-123',
        }),
        expect.anything()
      );
    });

    it('utilise cancel_at pour limiter la durée de l\'abonnement', async () => {
      await service.createSubscription(items, 0, undefined, 'user-123', 'user@test.fr');

      expect(stripeClient.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_at: expect.any(Number),
        })
      );
    });
  });
});
