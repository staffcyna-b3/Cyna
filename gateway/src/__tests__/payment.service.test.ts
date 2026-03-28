import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../config/stripe.config', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
}));

vi.mock('../models/Payment', () => ({
  default: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('axios', () => ({ default: { post: vi.fn() } }));

vi.mock('../common/logger', () => ({
  Logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../config/microService.config', () => ({
  MICROSERVICES: { PRODUCT: { url: 'http://product-service' } },
}));

// ── Imports (après les mocks) ─────────────────────────────────────────────────

import { PaymentService } from '../services/payment.service';
import { stripe } from '../config/stripe.config';
import Order from '../models/Payment';

// ── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
    vi.clearAllMocks();
  });

  // ── createPaymentIntent ───────────────────────────────────────────────────

  describe('createPaymentIntent', () => {
    const mockIntent = {
      id: 'pi_test_abc123',
      client_secret: 'pi_test_abc123_secret_xyz',
      amount: 481500,
      currency: 'eur',
      status: 'requires_payment_method',
    };

    it('crée un PaymentIntent Stripe et enregistre la commande en base', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockIntent as any);
      vi.mocked(Order.create).mockResolvedValue({} as any);

      const result = await service.createPaymentIntent(481500, 'eur', 'user-123', 'Commande test');

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 481500,
          currency: 'eur',
          description: 'Commande test',
          metadata: { userId: 'user-123' },
        })
      );

      expect(Order.create).toHaveBeenCalledWith({
        user_id: 'user-123',
        total_amount: 4815,       // centimes / 100
        stripe_payment_intent_id: 'pi_test_abc123',
        status: 'pending',        // requires_payment_method → pending
      });

      expect(result).toEqual({
        clientSecret: 'pi_test_abc123_secret_xyz',
        paymentIntentId: 'pi_test_abc123',
      });
    });

    it('normalise un montant décimal (19.99 → 1999 centimes)', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        ...mockIntent,
        amount: 1999,
      } as any);
      vi.mocked(Order.create).mockResolvedValue({} as any);

      await service.createPaymentIntent(19.99, 'eur', 'user-123');

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1999 })
      );
    });

    it('normalise la devise en minuscules', async () => {
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockIntent as any);
      vi.mocked(Order.create).mockResolvedValue({} as any);

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
        ...mockIntent,
        client_secret: null,
      } as any);

      await expect(service.createPaymentIntent(1000, 'eur', 'user-123')).rejects.toMatchObject({
        code: 'STRIPE_CLIENT_SECRET_MISSING',
      });
      expect(Order.create).not.toHaveBeenCalled();
    });
  });

  // ── handleStripeEvent (webhook) ───────────────────────────────────────────

  describe('handleStripeEvent', () => {
    it('passe le statut à "success" sur payment_intent.succeeded', async () => {
      vi.mocked(Order.update).mockResolvedValue([1] as any);

      await service.handleStripeEvent({
        type: 'payment_intent.succeeded',
        id: 'evt_succeeded',
        data: {
          object: {
            id: 'pi_test_abc123',
            amount: 481500,
            currency: 'eur',
            metadata: { userId: 'user-123' },
          },
        },
      } as any);

      expect(Order.update).toHaveBeenCalledWith(
        { status: 'success' },
        { where: { stripe_payment_intent_id: 'pi_test_abc123' } }
      );
    });

    it('passe le statut à "error" sur payment_intent.payment_failed', async () => {
      vi.mocked(Order.update).mockResolvedValue([1] as any);

      await service.handleStripeEvent({
        type: 'payment_intent.payment_failed',
        id: 'evt_failed',
        data: {
          object: {
            id: 'pi_test_def456',
            amount: 1000,
            currency: 'eur',
            metadata: { userId: 'user-123' },
          },
        },
      } as any);

      expect(Order.update).toHaveBeenCalledWith(
        { status: 'error' },
        { where: { stripe_payment_intent_id: 'pi_test_def456' } }
      );
    });

    it('ignore les événements inconnus sans toucher la base', async () => {
      await service.handleStripeEvent({
        type: 'customer.created',
        id: 'evt_unknown',
        data: { object: {} },
      } as any);

      expect(Order.update).not.toHaveBeenCalled();
    });
  });

  // ── retrievePaymentIntent ─────────────────────────────────────────────────

  describe('retrievePaymentIntent', () => {
    it('récupère l\'intent Stripe et met à jour le statut en base', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test_abc123',
        status: 'succeeded',
        amount: 481500,
        currency: 'eur',
        metadata: { userId: 'user-123' },
      } as any);
      vi.mocked(Order.update).mockResolvedValue([1] as any);

      const result = await service.retrievePaymentIntent('pi_test_abc123', 'user-123');

      expect(Order.update).toHaveBeenCalledWith(
        { status: 'success' },
        { where: { stripe_payment_intent_id: 'pi_test_abc123' } }
      );
      expect(result).toEqual({ status: 'succeeded', amount: 481500, currency: 'eur' });
    });

    it('lève FORBIDDEN si l\'intent appartient à un autre utilisateur', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test_abc123',
        status: 'succeeded',
        amount: 481500,
        currency: 'eur',
        metadata: { userId: 'autre-user' },
      } as any);

      await expect(service.retrievePaymentIntent('pi_test_abc123', 'user-123')).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      expect(Order.update).not.toHaveBeenCalled();
    });
  });
});
