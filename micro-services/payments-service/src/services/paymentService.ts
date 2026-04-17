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
import { PaymentType } from '../enum/PaymentType.enum';
import { PAYMENT_ERRORS } from '../constants/paymentErrors';

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
      this.handleStripeError(stripeError);
    }

    if (!intent.client_secret) {
      throw PAYMENT_ERRORS.CLIENT_SECRET_MISSING;
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
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.userId !== requestingUserId) {
      throw PAYMENT_ERRORS.FORBIDDEN;
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
      await this.addOneTimeInvoiceItem(customer.id, oneTimeAmountCents, 'eur', oneTimeDescription);
    }

    const durationMonths = subscriptionItems[0]?.durationMonths ?? 1;
    const cancelAt = this.computeCancelAt(durationMonths);
    const stripeProducts = await this.createStripeProducts(subscriptionItems);
    const subscription = await this.createStripeSubscription(customer.id, subscriptionItems, stripeProducts, cancelAt);

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const totalAmountCents =
      subscriptionItems.reduce((sum, item) => sum + item.priceAmountCents * item.quantity, 0) +
      oneTimeAmountCents;

    const pi = await this.createSubscriptionPaymentIntent(
      totalAmountCents,
      subscriptionItems[0].currency,
      customer.id,
      userId,
      userEmail,
      subscription.id,
      invoice.id
    );

    await this.orderRepository.create({
      user_id: userId,
      total_amount: totalAmountCents / 100,
      currency: subscriptionItems[0].currency,
      stripe_payment_intent_id: pi.id,
      payment_type: PaymentType.SUBSCRIPTION,
      status: OrderStatus.PENDING,
    });

    const periodEnd = this.computePeriodEnd(subscription, durationMonths);
    const periodStart = subscription.items.data[0]?.current_period_start ?? Math.floor(Date.now() / 1000);

    await this.sendSubscriptionCreatedToFrontOffice(
      subscription.id,
      userId,
      subscriptionItems,
      periodStart,
      periodEnd
    );

    Logger.info('[PAYMENT] Subscription created', {
      subscriptionId: subscription.id,
      paymentIntentId: pi.id,
      userId,
      totalAmountCents,
    });

    return {
      clientSecret: pi.client_secret!,
      subscriptionId: subscription.id,
      paymentIntentId: pi.id,
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
        await this.sendOrderConfirmationEmail(intent);
        await this.activateSubscriptionInvoice(intent);

        Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded processed', {
          eventId: event.id,
          paymentIntentId: intent.id,
          invoiceId: intent.metadata?.invoiceId ?? null,
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

  // ─── Private helpers — validation ───────────────────────────────────────────

  private normalizeAmount(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw PAYMENT_ERRORS.INVALID_AMOUNT;
    }
    if (!Number.isInteger(amount)) {
      return Math.round(amount * 100);
    }
    return amount;
  }

  private normalizeCurrency(currency: string): string {
    if (!currency || typeof currency !== 'string') {
      throw PAYMENT_ERRORS.INVALID_CURRENCY;
    }
    return currency.toLowerCase();
  }

  // ─── Private helpers — Stripe error handling ────────────────────────────────

  private handleStripeError(error: unknown): never {
    if (error instanceof Stripe.errors.StripeCardError) {
      throw PAYMENT_ERRORS.CARD_ERROR(error.message);
    }
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      throw PAYMENT_ERRORS.STRIPE_INVALID_REQUEST(error.message);
    }
    throw error;
  }

  // ─── Private helpers — Stripe operations ────────────────────────────────────

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

  private async addOneTimeInvoiceItem(
    customerId: string,
    amountCents: number,
    currency: string,
    description?: string
  ): Promise<void> {
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: amountCents,
      currency,
      description: description || 'Achat unique',
    });
  }

  private async createStripeProducts(items: SubscriptionItem[]): Promise<Stripe.Product[]> {
    return Promise.all(items.map((item) => stripe.products.create({ name: item.description })));
  }

  private computeCancelAt(durationMonths: number): number {
    const date = new Date();
    date.setMonth(date.getMonth() + durationMonths);
    return Math.floor(date.getTime() / 1000);
  }

  private computePeriodEnd(subscription: Stripe.Subscription, durationMonths: number): number {
    const periodStart = subscription.items.data[0]?.current_period_start ?? Math.floor(Date.now() / 1000);
    const endDate = new Date(periodStart * 1000);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    return Math.floor(endDate.getTime() / 1000);
  }

  private async createStripeSubscription(
    customerId: string,
    items: SubscriptionItem[],
    stripeProducts: Stripe.Product[],
    cancelAt: number
  ): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.create({
        customer: customerId,
        items: items.map((item, i) => ({
          price_data: {
            currency: item.currency,
            unit_amount: item.priceAmountCents,
            product: stripeProducts[i].id,
            recurring: { interval: 'month' },
          },
          quantity: item.quantity,
        })),
        cancel_at: cancelAt,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice'],
      });
    } catch (stripeError) {
      this.handleStripeError(stripeError);
    }
  }

  private async createSubscriptionPaymentIntent(
    totalAmountCents: number,
    currency: string,
    customerId: string,
    userId: string,
    userEmail: string,
    subscriptionId: string,
    invoiceId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.create({
        amount: totalAmountCents,
        currency,
        customer: customerId,
        metadata: { userId, userEmail, subscriptionId, invoiceId },
        automatic_payment_methods: { enabled: true },
      });
    } catch (stripeError) {
      this.handleStripeError(stripeError);
    }
  }

  // ─── Private helpers — order & email ────────────────────────────────────────

  private async updateOrderStatus(paymentIntentId: string, status: OrderStatus): Promise<void> {
    await this.orderRepository.updateStatusByPaymentIntentId(paymentIntentId, status);
  }

  private async sendOrderConfirmationEmail(intent: Stripe.PaymentIntent): Promise<void> {
    const userId = intent.metadata?.userId;
    const emailFromMetadata = intent.metadata?.userEmail;
    const recipientEmail = emailFromMetadata
      ?? (userId ? await this.paymentUserRepository.findEmailById(userId) : null);

    if (!recipientEmail) {
      Logger.error('[STRIPE WEBHOOK] No email found for order confirmation', {
        paymentIntentId: intent.id,
        hasUserId: !!userId,
        hasEmailInMetadata: !!emailFromMetadata,
      });
      return;
    }

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
  }

  private async activateSubscriptionInvoice(intent: Stripe.PaymentIntent): Promise<void> {
    const invoiceId = intent.metadata?.invoiceId;
    if (!invoiceId) return;

    const paymentMethod = typeof intent.payment_method === 'string'
      ? intent.payment_method
      : intent.payment_method?.id;

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

  // ─── Private helpers — inter-service communication ──────────────────────────

  private async sendTransactionToProductService(
    intent: Stripe.PaymentIntent,
    status: 'succeeded' | 'failed',
    eventId: string
  ): Promise<void> {
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
  ): Promise<void> {
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
  ): Promise<void> {
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
