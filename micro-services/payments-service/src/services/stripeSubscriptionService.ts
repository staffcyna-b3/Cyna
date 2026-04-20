import Stripe from 'stripe';
import { Logger } from '../common/logger';
import { MICROSERVICES } from '../config/microservices.config';
import { IOrderRepository } from '../interfaces/IOrderRepository';
import { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';
import { IStripeClient } from '../interfaces/IStripeClient';
import { IHttpClient } from '../interfaces/IHttpClient';
import { SubscriptionItem } from '../interfaces/SubscriptionItem.interface';
import { PaymentType } from '../enum/PaymentType.enum';
import { OrderStatus } from '../enum/OrderStatus.enum';
import { handleStripeError } from '../utils/paymentUtils';
import { HTTP_JSON_CONFIG } from '../constants/httpConfig';

export class StripeSubscriptionService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentUserRepository: IPaymentUserRepository,
    private readonly stripeClient: IStripeClient,
    private readonly httpClient: IHttpClient
  ) {}

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

  // ─── Private helpers — Stripe operations ────────────────────────────────────

  private async createOrGetStripeCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    const stripeCustomerId = await this.paymentUserRepository.findStripeCustomerId(userId);

    if (stripeCustomerId) {
      try {
        const existing = await this.stripeClient.customers.retrieve(stripeCustomerId);
        if (!existing.deleted) {
          return existing as Stripe.Customer;
        }
      } catch {
        // Customer no longer exists in Stripe — create a new one below
      }
    }

    const customer = await this.stripeClient.customers.create({ email, metadata: { userId } });
    await this.paymentUserRepository.updateStripeCustomerId(userId, customer.id);
    return customer;
  }

  private async addOneTimeInvoiceItem(
    customerId: string,
    amountCents: number,
    currency: string,
    description?: string
  ): Promise<void> {
    await this.stripeClient.invoiceItems.create({
      customer: customerId,
      amount: amountCents,
      currency,
      description: description || 'Achat unique',
    });
  }

  private async createStripeProducts(items: SubscriptionItem[]): Promise<Stripe.Product[]> {
    return Promise.all(items.map((item) => this.stripeClient.products.create({ name: item.description })));
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
    let subscription!: Stripe.Subscription;
    try {
      subscription = await this.stripeClient.subscriptions.create({
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
      handleStripeError(stripeError);
    }
    return subscription;
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
    let pi!: Stripe.PaymentIntent;
    try {
      pi = await this.stripeClient.paymentIntents.create({
        amount: totalAmountCents,
        currency,
        customer: customerId,
        metadata: { userId, userEmail, subscriptionId, invoiceId },
        automatic_payment_methods: { enabled: true },
      });
    } catch (stripeError) {
      handleStripeError(stripeError);
    }
    return pi;
  }

  // ─── Private helpers — inter-service communication ──────────────────────────

  private async sendSubscriptionCreatedToFrontOffice(
    stripeSubscriptionId: string,
    userId: string,
    items: SubscriptionItem[],
    periodStart: number,
    periodEnd: number
  ): Promise<void> {
    const url = `${MICROSERVICES.FRONTOFFICE.url}/subscriptions`;

    try {
      await this.httpClient.post(
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
        HTTP_JSON_CONFIG
      );
    } catch (error) {
      Logger.error('[PAYMENT] Failed to notify front-office of subscription creation', {
        stripeSubscriptionId,
        error: (error as any)?.message,
      });
    }
  }
}
