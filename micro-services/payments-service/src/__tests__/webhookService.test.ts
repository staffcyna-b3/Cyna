import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookService } from '../services/webhookService';
import type { IOrderRepository } from '../interfaces/IOrderRepository';
import type { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';
import type { IStripeClient } from '../interfaces/IStripeClient';
import type { IHttpClient } from '../interfaces/IHttpClient';
import type { IMailService } from '../interfaces/IMailService';

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

const makeMailService = (): IMailService => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
});

const makeHttpClient = (): IHttpClient => ({
  post:  vi.fn().mockResolvedValue(undefined),
  patch: vi.fn().mockResolvedValue(undefined),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('WebhookService', () => {
  let service: WebhookService;
  let stripeClient: IStripeClient;
  let orderRepo: IOrderRepository;
  let userRepo: IPaymentUserRepository;
  let mailService: IMailService;
  let httpClient: IHttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    stripeClient = makeStripeClient();
    orderRepo    = makeOrderRepo();
    userRepo     = makeUserRepo();
    mailService  = makeMailService();
    httpClient   = makeHttpClient();
    service = new WebhookService(orderRepo, userRepo, mailService, stripeClient, httpClient);
  });

  // ── payment_intent.succeeded ──────────────────────────────────────────────

  describe('payment_intent.succeeded', () => {
    it('passe le statut à "success" et notifie le product-service', async () => {
      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id:   'evt_succeeded',
        data: {
          object: {
            id:       'pi_test_abc123',
            amount:   481500,
            currency: 'eur',
            metadata: { userId: 'user-123', userEmail: 'user@test.fr' },
          },
        },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).toHaveBeenCalledWith(
        'pi_test_abc123', 'success'
      );
      expect(httpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/products/transactions'),
        expect.objectContaining({ paymentIntentId: 'pi_test_abc123', status: 'succeeded' }),
        expect.anything()
      );
    });

    it('ignore un payment_intent.succeeded déjà traité (idempotence)', async () => {
      vi.mocked(orderRepo.findByPaymentIntentId).mockResolvedValue({ status: 'success' } as any);

      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id:   'evt_duplicate',
        data: { object: { id: 'pi_test_abc123', metadata: {} } },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
    });

    it('active la subscription via subscriptions.update et invoices.pay si invoiceId est présent', async () => {
      vi.mocked(stripeClient.subscriptions.update).mockResolvedValue({} as any);
      vi.mocked(stripeClient.invoices.pay).mockResolvedValue({} as any);

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
              userEmail:      'user@test.fr',
              subscriptionId: 'sub_test_001',
              invoiceId:      'in_test_001',
            },
          },
        },
      } as any);

      expect(stripeClient.subscriptions.update).toHaveBeenCalledWith(
        'sub_test_001', { default_payment_method: 'pm_test_card' }
      );
      expect(stripeClient.invoices.pay).toHaveBeenCalledWith(
        'in_test_001', { paid_out_of_band: true }
      );
    });

    it('envoie un email de confirmation de commande', async () => {
      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id:   'evt_email',
        data: {
          object: {
            id:       'pi_test_abc123',
            amount:   14999,
            currency: 'eur',
            metadata: { userId: 'user-123', userEmail: 'user@test.fr' },
          },
        },
      } as any);

      expect(mailService.sendOrderConfirmationEmail).toHaveBeenCalledWith(
        'user@test.fr',
        expect.objectContaining({ paymentIntentId: 'pi_test_abc123' })
      );
    });
  });

  // ── payment_intent.payment_failed ─────────────────────────────────────────

  describe('payment_intent.payment_failed', () => {
    it('passe le statut à "error" et notifie le product-service', async () => {
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
      expect(httpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/products/transactions'),
        expect.objectContaining({ paymentIntentId: 'pi_test_def456', status: 'failed' }),
        expect.anything()
      );
    });

    it('ignore un payment_intent.payment_failed déjà traité (idempotence)', async () => {
      vi.mocked(orderRepo.findByPaymentIntentId).mockResolvedValue({ status: 'error' } as any);

      await service.handleStripeEvent({
        type: 'payment_intent.payment_failed',
        id:   'evt_duplicate_failed',
        data: { object: { id: 'pi_test_def456', metadata: {} } },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
    });
  });

  // ── invoice.payment_succeeded ─────────────────────────────────────────────

  describe('invoice.payment_succeeded', () => {
    it('notifie le front-office avec le statut "active"', async () => {
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

      expect(httpClient.patch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/status'),
        expect.objectContaining({ stripeSubscriptionId: 'sub_test_001', status: 'active' }),
        expect.anything()
      );
    });
  });

  // ── invoice.payment_failed ────────────────────────────────────────────────

  describe('invoice.payment_failed', () => {
    it('notifie le front-office avec le statut "inactive"', async () => {
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

      expect(httpClient.patch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/status'),
        expect.objectContaining({ stripeSubscriptionId: 'sub_test_001', status: 'inactive' }),
        expect.anything()
      );
    });
  });

  // ── customer.subscription.deleted ────────────────────────────────────────

  describe('customer.subscription.deleted', () => {
    it('notifie le front-office avec le statut "cancelled"', async () => {
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

      expect(httpClient.patch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions/status'),
        expect.objectContaining({ stripeSubscriptionId: 'sub_test_001', status: 'cancelled' }),
        expect.anything()
      );
    });
  });

  // ── événement inconnu ─────────────────────────────────────────────────────

  describe('événement inconnu', () => {
    it('ignore les événements non gérés sans toucher la base', async () => {
      await service.handleStripeEvent({
        type: 'customer.created',
        id:   'evt_unknown',
        data: { object: {} },
      } as any);

      expect(orderRepo.updateStatusByPaymentIntentId).not.toHaveBeenCalled();
      expect(httpClient.post).not.toHaveBeenCalled();
      expect(httpClient.patch).not.toHaveBeenCalled();
    });
  });
});
