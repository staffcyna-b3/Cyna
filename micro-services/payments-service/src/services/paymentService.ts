import axios from 'axios';
import Stripe from 'stripe';
import { OrderStatus } from '../enum/OrderStatus.enum';
import { stripe } from '../providers/stripe';
import { Logger } from '../common/logger';
import { MICROSERVICES } from '../config/microservices.config';
import { IOrderRepository } from '../interfaces/IOrderRepository';
import { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';
import { IMailService } from '../interfaces/IMailService';
import { SubscriptionItem } from '../interfaces/SubscriptionItem.interface';

export type { SubscriptionItem };

const toOrderStatus = (stripeStatus: string): OrderStatus => {
  if (stripeStatus === 'succeeded') return OrderStatus.SUCCESS;
  if (stripeStatus === 'canceled' || stripeStatus === 'payment_failed') return OrderStatus.ERROR;
  return OrderStatus.PENDING;
};

export class PaymentService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentUserRepository: IPaymentUserRepository,
    private readonly mailService: IMailService
  ) {}

  // ─── One-time payment ───────────────────────────────────────────────────────

  async createPaymentIntent(
    amount: number,
    currency: string,
    userId: string,
    description?: string,
    userEmail?: string
  ) {
    const normalizedAmount = this.normalizeAmount(amount);
    const normalizedCurrency = this.normalizeCurrency(currency);

    let intent: Stripe.PaymentIntent;
    try {
      intent = await stripe.paymentIntents.create({
        amount: normalizedAmount,
        currency: normalizedCurrency,
        description,
        metadata: { userId, ...(userEmail ? { userEmail } : {}) },
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

    await this.orderRepository.create({
      user_id: userId,
      total_amount: intent.amount / 100,
      currency: normalizedCurrency,
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

  // ─── Subscription payment ────────────────────────────────────────────────────

  async createSubscription(
    subscriptionItems: SubscriptionItem[],
    oneTimeAmountCents: number,
    oneTimeDescription: string | undefined,
    userId: string,
    userEmail: string
  ) {
    const customer = await this.createOrGetStripeCustomer(userId, userEmail);

    if (oneTimeAmountCents > 0) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: oneTimeAmountCents,
        currency: 'eur',
        description: oneTimeDescription || 'Achat unique',
      });
    }

    const stripeProducts = await Promise.all(
      subscriptionItems.map((item) => stripe.products.create({ name: item.description }))
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
        expand: ['latest_invoice'],
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

    const totalAmountCents =
      subscriptionItems.reduce((sum, item) => sum + item.priceAmountCents * item.quantity, 0) +
      oneTimeAmountCents;

    let pi: Stripe.PaymentIntent;
    try {
      pi = await stripe.paymentIntents.create({
        amount: totalAmountCents,
        currency: subscriptionItems[0].currency,
        customer: customer.id,
        metadata: {
          userId,
          userEmail,
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
        },
        automatic_payment_methods: { enabled: true },
      });
    } catch (stripeError) {
      if (stripeError instanceof Stripe.errors.StripeInvalidRequestError) {
        throw { status: 400, code: 'STRIPE_INVALID_REQUEST', message: (stripeError as Stripe.errors.StripeInvalidRequestError).message };
      }
      throw stripeError;
    }

    const clientSecret = pi.client_secret!;
    const paymentIntentId = pi.id;

    await this.orderRepository.create({
      user_id: userId,
      total_amount: totalAmountCents / 100,
      currency: subscriptionItems[0].currency,
      stripe_payment_intent_id: paymentIntentId,
      payment_type: 'subscription',
      status: OrderStatus.PENDING,
    });

    const firstItem = subscription.items.data[0];
    const periodStart = firstItem?.current_period_start ?? Math.floor(Date.now() / 1000);
    const periodEnd =
      firstItem?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

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

        const existing = await this.orderRepository.findByPaymentIntentId(intent.id);
        if (existing?.status === OrderStatus.SUCCESS) {
          Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded already processed, skipping', {
            eventId: event.id,
            paymentIntentId: intent.id,
          });
          break;
        }

        await this.updateOrderStatus(intent.id, OrderStatus.SUCCESS);
        await this.sendTransactionToProductService(intent, 'succeeded', event.id);

        const userId = intent.metadata?.userId;
        const emailFromMetadata = intent.metadata?.userEmail;
        const recipientEmail = emailFromMetadata
          ?? (userId ? await this.paymentUserRepository.findEmailById(userId) : null);

        if (recipientEmail) {
          try {
            await this.mailService.sendOrderConfirmationEmail(recipientEmail, {
              amountCents: intent.amount,
              currency: intent.currency,
              paymentIntentId: intent.id,
              paymentType: intent.metadata?.subscriptionId ? 'subscription' : 'one_time',
            });
            Logger.info('[STRIPE WEBHOOK] Order confirmation email sent', { paymentIntentId: intent.id });
          } catch (err) {
            Logger.error('[STRIPE WEBHOOK] Failed to send order confirmation email', {
              paymentIntentId: intent.id,
              error: (err as any)?.message,
            });
          }
        } else {
          Logger.error('[STRIPE WEBHOOK] No email found for order confirmation', {
            paymentIntentId: intent.id,
            hasUserId: !!userId,
            hasEmailInMetadata: !!emailFromMetadata,
          });
        }

        const invoiceId = intent.metadata?.invoiceId;
        const paymentMethod = typeof intent.payment_method === 'string'
          ? intent.payment_method
          : intent.payment_method?.id;

        if (invoiceId) {
          try {
            if (paymentMethod && intent.metadata?.subscriptionId) {
              await stripe.subscriptions.update(intent.metadata.subscriptionId, {
                default_payment_method: paymentMethod,
              });
            }
            await stripe.invoices.pay(invoiceId, { paid_out_of_band: true });
          } catch (err) {
            Logger.error('[STRIPE WEBHOOK] Failed to activate subscription invoice', {
              invoiceId,
              subscriptionId: intent.metadata?.subscriptionId,
              error: (err as any)?.message,
            });
          }
        }

        Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded processed', {
          eventId: event.id,
          paymentIntentId: intent.id,
          invoiceId: invoiceId ?? null,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;

        const existing = await this.orderRepository.findByPaymentIntentId(intent.id);
        if (existing?.status === OrderStatus.ERROR) {
          Logger.info('[STRIPE WEBHOOK] payment_intent.payment_failed already processed, skipping', {
            eventId: event.id,
            paymentIntentId: intent.id,
          });
          break;
        }

        await this.updateOrderStatus(intent.id, OrderStatus.ERROR);
        await this.sendTransactionToProductService(intent, 'failed', event.id);
        Logger.info('[STRIPE WEBHOOK] payment_intent.payment_failed processed', {
          eventId: event.id,
          paymentIntentId: intent.id,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = (invoice as any).parent?.subscription_details?.subscription;
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
        const subRef = (invoice as any).parent?.subscription_details?.subscription;
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
      throw { status: 400, code: 'INVALID_AMOUNT', message: 'Le montant doit être un nombre strictement positif' };
    }
    if (!Number.isInteger(amount)) {
      return Math.round(amount * 100);
    }
    return amount;
  }

  private normalizeCurrency(currency: string): string {
    if (!currency || typeof currency !== 'string') {
      throw { status: 400, code: 'INVALID_CURRENCY', message: 'Devise invalide' };
    }
    return currency.toLowerCase();
  }

  private async updateOrderStatus(paymentIntentId: string, status: OrderStatus): Promise<void> {
    await this.orderRepository.updateStatusByPaymentIntentId(paymentIntentId, status);
  }

  private async createOrGetStripeCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    const stripeCustomerId = await this.paymentUserRepository.findStripeCustomerId(userId);

    if (stripeCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(stripeCustomerId);
        if (!existing.deleted) {
          return existing as Stripe.Customer;
        }
      } catch {
        // Customer no longer exists in Stripe — create a new one below
      }
    }

    const customer = await stripe.customers.create({ email, metadata: { userId } });
    await this.paymentUserRepository.updateStripeCustomerId(userId, customer.id);
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
