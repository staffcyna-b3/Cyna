import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentIntentService } from '../services/paymentIntentService';
import type { IOrderRepository } from '../interfaces/IOrderRepository';
import type { IStripeClient } from '../interfaces/IStripeClient';

// ── Factories ─────────────────────────────────────────────────────────────────

const makeStripeClient = (): IStripeClient => ({
  paymentIntents: {
    create:   vi.fn(),
    retrieve: vi.fn(),
  },
  invoiceItems:  { create: vi.fn() },
  products:      { create: vi.fn() },
  subscriptions: { create: vi.fn(), update: vi.fn() },
  invoices:      { pay: vi.fn() },
  customers:     { create: vi.fn(), retrieve: vi.fn() },
  webhooks:      { constructEvent: vi.fn() },
});

const makeOrderRepo = (): IOrderRepository => ({
  create:                        vi.fn().mockResolvedValue(undefined),
  findByPaymentIntentId:         vi.fn().mockResolvedValue(null),
  updateStatusByPaymentIntentId: vi.fn().mockResolvedValue(undefined),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PaymentIntentService', () => {
  let service: PaymentIntentService;
  let stripeClient: IStripeClient;
  let orderRepo: IOrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    stripeClient = makeStripeClient();
    orderRepo    = makeOrderRepo();
    service      = new PaymentIntentService(orderRepo, stripeClient);
  });

  // ── createPaymentIntent ───────────────────────────────────────────────────

  describe('createPaymentIntent', () => {
    const mockIntent = {
      id:            'pi_test_abc123',
      client_secret: 'pi_test_abc123_secret_xyz',
      amount:        481500,
      currency:      'eur',
      status:        'requires_payment_method',
      metadata:      { userId: 'user-123' },
    };

    it('crée un PaymentIntent Stripe et enregistre la commande via le repository', async () => {
      vi.mocked(stripeClient.paymentIntents.create).mockResolvedValue(mockIntent as any);

      const result = await service.createPaymentIntent(481500, 'eur', 'user-123', 'Commande test');

      expect(stripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount:      481500,
          currency:    'eur',
          description: 'Commande test',
          metadata:    expect.objectContaining({ userId: 'user-123' }),
        })
      );
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id:                  'user-123',
          total_amount:             4815,
          currency:                 'eur',
          stripe_payment_intent_id: 'pi_test_abc123',
          payment_type:             'one_time',
          status:                   'pending',
        })
      );
      expect(result).toEqual({
        clientSecret:    'pi_test_abc123_secret_xyz',
        paymentIntentId: 'pi_test_abc123',
      });
    });

    it('normalise un montant décimal (19.99 → 1999 centimes)', async () => {
      vi.mocked(stripeClient.paymentIntents.create).mockResolvedValue({ ...mockIntent, amount: 1999 } as any);

      await service.createPaymentIntent(19.99, 'eur', 'user-123');

      expect(stripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1999 })
      );
    });

    it('normalise la devise en minuscules', async () => {
      vi.mocked(stripeClient.paymentIntents.create).mockResolvedValue(mockIntent as any);

      await service.createPaymentIntent(1000, 'EUR', 'user-123');

      expect(stripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'eur' })
      );
    });

    it('lève INVALID_AMOUNT si le montant est négatif', async () => {
      await expect(service.createPaymentIntent(-100, 'eur', 'user-123')).rejects.toMatchObject({
        code: 'INVALID_AMOUNT',
      });
      expect(stripeClient.paymentIntents.create).not.toHaveBeenCalled();
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
      vi.mocked(stripeClient.paymentIntents.create).mockResolvedValue({
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
      vi.mocked(stripeClient.paymentIntents.retrieve).mockResolvedValue({
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
      vi.mocked(stripeClient.paymentIntents.retrieve).mockResolvedValue({
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
});
