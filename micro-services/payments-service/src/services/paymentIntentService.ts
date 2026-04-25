import Stripe from 'stripe';
import { Logger } from '../common/logger';
import { IOrderRepository } from '../interfaces/IOrderRepository';
import { IStripeClient } from '../interfaces/IStripeClient';
import { PaymentType } from '../enum/PaymentType.enum';
import { PAYMENT_ERRORS } from '../constants/paymentErrors';
import { toOrderStatus, handleStripeError } from '../utils/paymentUtils';

export class PaymentIntentService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly stripeClient: IStripeClient
  ) {}

  async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    description?: string,
    userEmail?: string
  ) {
    const normalizedAmount = this.normalizeAmount(amount);
    const normalizedCurrency = this.normalizeCurrency(currency);

    let intent!: Stripe.PaymentIntent;
    try {
      intent = await this.stripeClient.paymentIntents.create({
        amount: normalizedAmount,
        currency: normalizedCurrency,
        description,
        metadata: { userId, ...(userEmail ? { userEmail } : {}) },
        automatic_payment_methods: { enabled: true },
      });
    } catch (stripeError) {
      handleStripeError(stripeError);
    }

    if (!intent.client_secret) {
      throw PAYMENT_ERRORS.CLIENT_SECRET_MISSING();
    }

    await this.orderRepository.create({
      user_id: userId,
      total_amount: intent.amount / 100,
      currency: normalizedCurrency,
      stripe_payment_intent_id: intent.id,
      payment_type: PaymentType.ONE_TIME,
      status: toOrderStatus(intent.status),
    });

    Logger.info('[PAYMENT] PaymentIntent created', {
      paymentIntentId: intent.id,
      userId,
      amount: intent.amount,
      currency: intent.currency,
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  async retrievePaymentIntent(paymentIntentId: string, requestingUserId: string) {
    let intent!: Stripe.PaymentIntent;
    try {
      intent = await this.stripeClient.paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError) {
      handleStripeError(stripeError);
    }

    if (intent.metadata?.userId !== requestingUserId) {
      throw PAYMENT_ERRORS.FORBIDDEN();
    }

    await this.orderRepository.updateStatusByPaymentIntentId(
      intent.id,
      toOrderStatus(intent.status)
    );

    return {
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
    };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private normalizeAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw PAYMENT_ERRORS.INVALID_AMOUNT();
    }
    if (!Number.isInteger(amount)) {
      return Math.round(amount * 100);
    }
    return amount;
  }

  private normalizeCurrency(currency: string): string {
    if (!currency || typeof currency !== 'string') {
      throw PAYMENT_ERRORS.INVALID_CURRENCY();
    }
    return currency.toLowerCase();
  }
}
