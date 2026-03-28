import axios from 'axios';
import Stripe from 'stripe';
import Order, { OrderStatus } from '../models/Payment';
import { stripe } from '../config/stripe.config';
import { Logger } from '../common/logger';
import { MICROSERVICES } from '../config/microService.config';

const toOrderStatus = (stripeStatus: string): OrderStatus => {
  if (stripeStatus === 'succeeded') return 'success';
  if (stripeStatus === 'canceled' || stripeStatus === 'payment_failed') return 'error';
  return 'pending';
};

export class PaymentService {
  async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    description?: string
  ) {
    const normalizedAmount = this.normalizeAmount(amount);
    const normalizedCurrency = this.normalizeCurrency(currency);

    const intent = await stripe.paymentIntents.create({
      amount: normalizedAmount,
      currency: normalizedCurrency,
      description,
      metadata: {
        userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!intent.client_secret) {
      throw {
        status: 500,
        code: 'STRIPE_CLIENT_SECRET_MISSING',
        message: 'Stripe n\'a pas retourne de clientSecret',
      };
    }

    await Order.create({
      user_id: userId,
      total_amount: intent.amount / 100,
      stripe_payment_intent_id: intent.id,
      status: toOrderStatus(intent.status),
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  async retrievePaymentIntent(paymentIntentId: string, requestingUserId: string) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.userId !== requestingUserId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Vous n\'etes pas autorise a consulter ce paiement',
      };
    }

    await Order.update(
      { status: toOrderStatus(intent.status) },
      { where: { stripe_payment_intent_id: intent.id } }
    );

    return {
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
    };
  }

  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.updateOrderStatus(intent.id, 'success');
        await this.sendTransactionToProductService(intent, 'succeeded', event.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.updateOrderStatus(intent.id, 'error');
        await this.sendTransactionToProductService(intent, 'failed', event.id);
        break;
      }
      default:
        Logger.info(`[STRIPE WEBHOOK] Ignored event: ${event.type}`);
    }
  }

  private normalizeAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw {
        status: 400,
        code: 'INVALID_AMOUNT',
        message: 'Le montant doit etre un nombre strictement positif',
      };
    }

    // If decimal amount is sent (e.g. 19.99), convert to smallest unit.
    if (!Number.isInteger(amount)) {
      return Math.round(amount * 100);
    }

    return amount;
  }

  private normalizeCurrency(currency: string): string {
    if (!currency || typeof currency !== 'string') {
      throw {
        status: 400,
        code: 'INVALID_CURRENCY',
        message: 'Devise invalide',
      };
    }

    return currency.toLowerCase();
  }

  private async updateOrderStatus(paymentIntentId: string, status: OrderStatus) {
    await Order.update({ status }, { where: { stripe_payment_intent_id: paymentIntentId } });
  }

  private async sendTransactionToProductService(
    intent: Stripe.PaymentIntent,
    status: 'succeeded' | 'failed',
    eventId: string
  ) {
    const transactionPath = process.env.PRODUCTS_TRANSACTION_PATH || '/products/transactions';
    const url = `${MICROSERVICES.PRODUCT.url}${transactionPath}`;

    try {
      await axios.post(
        url,
        {
          stripeEventId: eventId,
          paymentIntentId: intent.id,
          userId: intent.metadata?.userId || null,
          amount: intent.amount,
          currency: intent.currency,
          status,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
    } catch (error) {
      Logger.error('[PAYMENT] Failed to notify product service', {
        paymentIntentId: intent.id,
        status,
        error,
      });
    }
  }
}
