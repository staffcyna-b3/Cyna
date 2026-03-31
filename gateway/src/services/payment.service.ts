import axios from 'axios';
import Stripe from 'stripe';
import Order, { OrderStatus } from '../models/Payment';
import User from '../models/User';
import { stripe } from '../config/stripe.config';
import { Logger } from '../common/logger';
import { MICROSERVICES } from '../config/microService.config';

const toOrderStatus = (stripeStatus: string): OrderStatus => {
  if (stripeStatus === 'succeeded') return 'success';
  if (stripeStatus === 'canceled' || stripeStatus === 'payment_failed') return 'error';
  return 'pending';
};

export interface SubscriptionItem {
  productId: string;
  priceAmountCents: number;
  currency: string;
  description: string;
  billingPeriod: 'monthly' | 'yearly';
  quantity: number;
}

export class PaymentService {
  // ─── One-time payment ───────────────────────────────────────────────────────

  async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    description?: string
  ) {
    const normalizedAmount = this.normalizeAmount(amount);
    const normalizedCurrency = this.normalizeCurrency(currency);

    let intent: Stripe.PaymentIntent;
    try {
      intent = await stripe.paymentIntents.create({
        amount: normalizedAmount,
        currency: normalizedCurrency,
        description,
        metadata: { userId },
        automatic_payment_methods: { enabled: true },
      });
    } catch (stripeError) {
      if (stripeError instanceof Stripe.errors.StripeCardError) {
        throw { status: 402, code: 'CARD_ERROR', message: stripeError.message };
      }
      if (stripeError instanceof Stripe.errors.StripeInvalidRequestError) {
        throw { status: 400, code: 'STRIPE_INVALID_REQUEST', message: stripeError.message };
      }
      throw stripeError;
    }

    if (!intent.client_secret) {
      throw {
        status: 500,
        code: 'STRIPE_CLIENT_SECRET_MISSING',
        message: 'Stripe n\'a pas retourné de clientSecret',
      };
    }

    await Order.create({
      user_id: userId,
      total_amount: intent.amount / 100,
      stripe_payment_intent_id: intent.id,
      payment_type: 'one_time',
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
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.userId !== requestingUserId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Vous n\'êtes pas autorisé à consulter ce paiement',
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

  // ─── Subscription payment ────────────────────────────────────────────────────

  async createSubscription(
    subscriptionItems: SubscriptionItem[],
    oneTimeAmountCents: number,
    oneTimeDescription: string | undefined,
    userId: string,
    userEmail: string
  ) {
    const customer = await this.createOrGetStripeCustomer(userId, userEmail);

    // One-time items are added as invoice items charged on the first invoice
    if (oneTimeAmountCents > 0) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: oneTimeAmountCents,
        currency: 'eur',
        description: oneTimeDescription || 'Achat unique',
      });
    }

    // Each item needs an existing Stripe Product — create them inline
    const stripeProducts = await Promise.all(
      subscriptionItems.map((item) =>
        stripe.products.create({ name: item.description })
      )
    );

    let subscription: Stripe.Subscription;
    try {
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: subscriptionItems.map((item, i) => ({
          price_data: {
            currency: item.currency,
            unit_amount: item.priceAmountCents,
            product: stripeProducts[i].id,
            recurring: {
              interval: item.billingPeriod === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: item.quantity,
        })),
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (stripeError) {
      if (stripeError instanceof Stripe.errors.StripeCardError) {
        throw { status: 402, code: 'CARD_ERROR', message: (stripeError as Stripe.errors.StripeCardError).message };
      }
      if (stripeError instanceof Stripe.errors.StripeInvalidRequestError) {
        throw { status: 400, code: 'STRIPE_INVALID_REQUEST', message: (stripeError as Stripe.errors.StripeInvalidRequestError).message };
      }
      throw stripeError;
    }

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    // payment_intent is expanded — TypeScript types lag behind, use cast
    const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent | null;
    const clientSecret =
      paymentIntent?.client_secret ?? invoice.confirmation_secret?.client_secret;

    if (!clientSecret) {
      Logger.error('[PAYMENT] No clientSecret on subscription invoice', {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        invoiceStatus: invoice.status,
      });
      throw {
        status: 500,
        code: 'STRIPE_CLIENT_SECRET_MISSING',
        message: 'Stripe n\'a pas retourné de clientSecret pour l\'abonnement',
      };
    }

    const paymentIntentId = paymentIntent?.id ?? clientSecret.split('_secret_')[0];

    const totalAmountCents =
      subscriptionItems.reduce((sum, item) => sum + item.priceAmountCents * item.quantity, 0) +
      oneTimeAmountCents;

    await Order.create({
      user_id: userId,
      total_amount: totalAmountCents / 100,
      stripe_payment_intent_id: paymentIntentId,
      payment_type: 'subscription',
      status: 'pending',
    });

    // API 2026-02-25.clover: period is on subscription items, not on subscription directly
    const firstItem = subscription.items.data[0];
    const periodStart = firstItem?.current_period_start ?? Math.floor(Date.now() / 1000);
    const periodEnd = firstItem?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

    await this.sendSubscriptionCreatedToFrontOffice(
      subscription.id,
      userId,
      subscriptionItems,
      periodStart,
      periodEnd
    );

    Logger.info('[PAYMENT] Subscription created', {
      subscriptionId: subscription.id,
      paymentIntentId,
      userId,
      totalAmountCents,
    });

    return {
      clientSecret,
      subscriptionId: subscription.id,
      paymentIntentId,
    };
  }

  // ─── Webhook event handler ───────────────────────────────────────────────────

  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;

        const existing = await Order.findOne({ where: { stripe_payment_intent_id: intent.id } });
        if (existing?.status === 'success') {
          Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded already processed, skipping', {
            eventId: event.id,
            paymentIntentId: intent.id,
          });
          break;
        }

        await this.updateOrderStatus(intent.id, 'success');
        await this.sendTransactionToProductService(intent, 'succeeded', event.id);
        Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded processed', {
          eventId: event.id,
          paymentIntentId: intent.id,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;

        const existing = await Order.findOne({ where: { stripe_payment_intent_id: intent.id } });
        if (existing?.status === 'error') {
          Logger.info('[STRIPE WEBHOOK] payment_intent.payment_failed already processed, skipping', {
            eventId: event.id,
            paymentIntentId: intent.id,
          });
          break;
        }

        await this.updateOrderStatus(intent.id, 'error');
        await this.sendTransactionToProductService(intent, 'failed', event.id);
        Logger.info('[STRIPE WEBHOOK] payment_intent.payment_failed processed', {
          eventId: event.id,
          paymentIntentId: intent.id,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // API 2026-02-25.clover: subscription is nested under parent.subscription_details
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) break;

        const subscriptionId = typeof subRef === 'string' ? subRef : subRef.id;

        await this.sendSubscriptionStatusToFrontOffice(subscriptionId, 'active', event.id);
        Logger.info('[STRIPE WEBHOOK] invoice.payment_succeeded processed', {
          eventId: event.id,
          subscriptionId,
          invoiceId: invoice.id,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (!subRef) break;

        const subscriptionId = typeof subRef === 'string' ? subRef : subRef.id;

        await this.sendSubscriptionStatusToFrontOffice(subscriptionId, 'inactive', event.id);
        Logger.info('[STRIPE WEBHOOK] invoice.payment_failed processed', {
          eventId: event.id,
          subscriptionId,
          invoiceId: invoice.id,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await this.sendSubscriptionStatusToFrontOffice(subscription.id, 'cancelled', event.id);
        Logger.info('[STRIPE WEBHOOK] customer.subscription.deleted processed', {
          eventId: event.id,
          subscriptionId: subscription.id,
        });
        break;
      }

      default:
        Logger.info(`[STRIPE WEBHOOK] Ignored event: ${event.type}`);
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private normalizeAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw {
        status: 400,
        code: 'INVALID_AMOUNT',
        message: 'Le montant doit être un nombre strictement positif',
      };
    }
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

  private async createOrGetStripeCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    const user = await User.findOne({ where: { id: userId } });

    if (user?.stripe_customer_id) {
      try {
        const existing = await stripe.customers.retrieve(user.stripe_customer_id);
        if (!existing.deleted) {
          return existing as Stripe.Customer;
        }
      } catch {
        // Customer no longer exists in Stripe — create a new one below
      }
    }

    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    await User.update({ stripe_customer_id: customer.id }, { where: { id: userId } });

    return customer;
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
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
    } catch (error) {
      Logger.error('[PAYMENT] Failed to notify product service', {
        paymentIntentId: intent.id,
        status,
        error: (error as any)?.message,
      });
    }
  }

  private async sendSubscriptionCreatedToFrontOffice(
    stripeSubscriptionId: string,
    userId: string,
    items: SubscriptionItem[],
    periodStart: number,
    periodEnd: number
  ) {
    const url = `${MICROSERVICES.FRONTOFFICE.url}/subscriptions`;

    try {
      await axios.post(
        url,
        {
          stripeSubscriptionId,
          userId,
          items: items.map((item) => ({
            productId: item.productId,
            price: (item.priceAmountCents * item.quantity) / 100,
            billingPeriod: item.billingPeriod,
          })),
          startDate: new Date(periodStart * 1000).toISOString(),
          endDate: new Date(periodEnd * 1000).toISOString(),
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
    } catch (error) {
      Logger.error('[PAYMENT] Failed to notify front-office of subscription creation', {
        stripeSubscriptionId,
        error: (error as any)?.message,
      });
    }
  }

  private async sendSubscriptionStatusToFrontOffice(
    stripeSubscriptionId: string,
    status: 'active' | 'inactive' | 'cancelled',
    eventId: string
  ) {
    const url = `${MICROSERVICES.FRONTOFFICE.url}/subscriptions/status`;

    try {
      await axios.patch(
        url,
        { stripeSubscriptionId, status },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
    } catch (error) {
      Logger.error('[PAYMENT] Failed to notify front-office of subscription status update', {
        stripeSubscriptionId,
        status,
        eventId,
        error: (error as any)?.message,
      });
    }
  }
}
