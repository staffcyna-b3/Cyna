import Stripe from 'stripe';
import { Logger } from '../common/logger';
import { MICROSERVICES } from '../config/microservices.config';
import { IOrderRepository } from '../interfaces/IOrderRepository';
import { IPaymentUserRepository } from '../interfaces/IPaymentUserRepository';
import { IMailService } from '../interfaces/IMailService';
import { IStripeClient } from '../interfaces/IStripeClient';
import { IHttpClient } from '../interfaces/IHttpClient';
import { OrderStatus } from '../enum/OrderStatus.enum';
import { HTTP_JSON_CONFIG } from '../constants/httpConfig';

export class WebhookService {
  // In-memory deduplication for invoice/subscription events.
  // Covers Stripe immediate retries (seconds–minutes). Cleared on restart — acceptable
  // trade-off given the constraint of not adding a stripe_event_ids table.
  private readonly seenEventIds = new Set<string>();

  private readonly eventHandlers = new Map<string, (event: Stripe.Event) => Promise<void>>([
    ['payment_intent.succeeded',      (e) => this.onPaymentIntentSucceeded(e)],
    ['payment_intent.payment_failed', (e) => this.onPaymentIntentFailed(e)],
    ['invoice.payment_succeeded',     (e) => this.onInvoicePaymentSucceeded(e)],
    ['invoice.payment_failed',        (e) => this.onInvoicePaymentFailed(e)],
    ['customer.subscription.deleted', (e) => this.onSubscriptionDeleted(e)],
  ]);

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentUserRepository: IPaymentUserRepository,
    private readonly mailService: IMailService,
    private readonly stripeClient: IStripeClient,
    private readonly httpClient: IHttpClient
  ) {}

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      await handler(event);
    } else {
      Logger.info(`[STRIPE WEBHOOK] Ignored event: ${event.type}`);
    }
  }

  // ─── Event handlers ──────────────────────────────────────────────────────────

  private async onPaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    const intent = event.data.object as Stripe.PaymentIntent;

    const existing = await this.orderRepository.findByPaymentIntentId(intent.id);
    if (existing?.status === OrderStatus.SUCCESS) {
      Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded already processed, skipping', {
        eventId: event.id,
        paymentIntentId: intent.id,
      });
      return;
    }

    await this.updateOrderStatus(intent.id, OrderStatus.SUCCESS);
    await this.updateFrontOfficeOrderStatus(intent.id, 'PAID');
    await this.sendTransactionToProductService(intent, 'succeeded', event.id);
    await this.sendOrderConfirmationEmail(intent);
    await this.activateSubscriptionInvoice(intent);

    Logger.info('[STRIPE WEBHOOK] payment_intent.succeeded processed', {
      eventId: event.id,
      paymentIntentId: intent.id,
      invoiceId: intent.metadata?.invoiceId ?? null,
    });
  }

  private async onPaymentIntentFailed(event: Stripe.Event): Promise<void> {
    const intent = event.data.object as Stripe.PaymentIntent;

    const existing = await this.orderRepository.findByPaymentIntentId(intent.id);
    if (existing?.status === OrderStatus.ERROR) {
      Logger.info('[STRIPE WEBHOOK] payment_intent.payment_failed already processed, skipping', {
        eventId: event.id,
        paymentIntentId: intent.id,
      });
      return;
    }

    await this.updateOrderStatus(intent.id, OrderStatus.ERROR);
    await this.sendTransactionToProductService(intent, 'failed', event.id);
    Logger.info('[STRIPE WEBHOOK] payment_intent.payment_failed processed', {
      eventId: event.id,
      paymentIntentId: intent.id,
    });
  }

  private async onInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
    if (this.seenEventIds.has(event.id)) {
      Logger.info('[STRIPE WEBHOOK] invoice.payment_succeeded already processed, skipping', { eventId: event.id });
      return;
    }
    this.seenEventIds.add(event.id);

    const invoice = event.data.object as Stripe.Invoice;
    const subRef = (invoice as any).parent?.subscription_details?.subscription;
    if (!subRef) return;

    const subscriptionId = typeof subRef === 'string' ? subRef : subRef.id;
    await this.sendSubscriptionStatusToFrontOffice(subscriptionId, 'active', event.id);
    Logger.info('[STRIPE WEBHOOK] invoice.payment_succeeded processed', {
      eventId: event.id,
      subscriptionId,
      invoiceId: invoice.id,
    });
  }

  private async onInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    if (this.seenEventIds.has(event.id)) {
      Logger.info('[STRIPE WEBHOOK] invoice.payment_failed already processed, skipping', { eventId: event.id });
      return;
    }
    this.seenEventIds.add(event.id);

    const invoice = event.data.object as Stripe.Invoice;
    const subRef = (invoice as any).parent?.subscription_details?.subscription;
    if (!subRef) return;

    const subscriptionId = typeof subRef === 'string' ? subRef : subRef.id;
    await this.sendSubscriptionStatusToFrontOffice(subscriptionId, 'inactive', event.id);
    Logger.info('[STRIPE WEBHOOK] invoice.payment_failed processed', {
      eventId: event.id,
      subscriptionId,
      invoiceId: invoice.id,
    });
  }

  private async onSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    if (this.seenEventIds.has(event.id)) {
      Logger.info('[STRIPE WEBHOOK] customer.subscription.deleted already processed, skipping', { eventId: event.id });
      return;
    }
    this.seenEventIds.add(event.id);

    const subscription = event.data.object as Stripe.Subscription;
    await this.sendSubscriptionStatusToFrontOffice(subscription.id, 'cancelled', event.id);
    Logger.info('[STRIPE WEBHOOK] customer.subscription.deleted processed', {
      eventId: event.id,
      subscriptionId: subscription.id,
    });
  }

  // ─── Private helpers — order ─────────────────────────────────────────────────

  private async updateOrderStatus(paymentIntentId: string, status: OrderStatus): Promise<void> {
    await this.orderRepository.updateStatusByPaymentIntentId(paymentIntentId, status);
  }

  // ─── Private helpers — email ─────────────────────────────────────────────────

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

  // ─── Private helpers — Stripe ────────────────────────────────────────────────

  private async activateSubscriptionInvoice(intent: Stripe.PaymentIntent): Promise<void> {
    const invoiceId = intent.metadata?.invoiceId;
    if (!invoiceId) return;

    const paymentMethod = typeof intent.payment_method === 'string'
      ? intent.payment_method
      : intent.payment_method?.id;

    try {
      if (paymentMethod && intent.metadata?.subscriptionId) {
        await this.stripeClient.subscriptions.update(intent.metadata.subscriptionId, {
          default_payment_method: paymentMethod,
        });
      }
      await this.stripeClient.invoices.pay(invoiceId, { paid_out_of_band: true });
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
    const transactionPath = process.env.PRODUCTS_TRANSACTION_PATH || '/payment-notification';
    const url = `${MICROSERVICES.PRODUCT.url}${transactionPath}`;

    let items: { product_id: string; quantity: number }[] = [];
    if (status === 'succeeded') {
      try {
        const itemsUrl = `${MICROSERVICES.FRONTOFFICE.url}/orders/by-payment-intent/${intent.id}/items`;
        items = await this.httpClient.get<{ product_id: string; quantity: number }[]>(itemsUrl);
      } catch (error) {
        Logger.error('[PAYMENT] Failed to fetch order items from front-office', {
          paymentIntentId: intent.id,
          error: (error as any)?.message,
        });
      }
    }

    try {
      await this.httpClient.post(
        url,
        {
          stripeEventId: eventId,
          paymentIntentId: intent.id,
          userId: intent.metadata?.userId || null,
          amount: intent.amount,
          currency: intent.currency,
          status,
          items,
        },
        HTTP_JSON_CONFIG
      );
    } catch (error) {
      Logger.error('[PAYMENT] Failed to notify product service', {
        paymentIntentId: intent.id,
        status,
        error: (error as any)?.message,
      });
    }
  }

  private async updateFrontOfficeOrderStatus(paymentIntentId: string, status: string): Promise<void> {
    const url = `${MICROSERVICES.FRONTOFFICE.url}/orders/by-payment-intent/${paymentIntentId}/status`;
    try {
      await this.httpClient.patch(url, { status }, HTTP_JSON_CONFIG);
    } catch (error) {
      Logger.error('[PAYMENT] Failed to update front-office order status', {
        paymentIntentId,
        status,
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
      await this.httpClient.patch(
        url,
        { stripeSubscriptionId, status },
        HTTP_JSON_CONFIG
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
