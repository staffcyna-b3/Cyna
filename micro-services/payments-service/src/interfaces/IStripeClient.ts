import Stripe from 'stripe';

export interface IStripeClient {
  paymentIntents: {
    create(params: Stripe.PaymentIntentCreateParams): Promise<Stripe.PaymentIntent>;
    retrieve(id: string): Promise<Stripe.PaymentIntent>;
  };
  invoiceItems: {
    create(params: Stripe.InvoiceItemCreateParams): Promise<Stripe.InvoiceItem>;
  };
  products: {
    create(params: Stripe.ProductCreateParams): Promise<Stripe.Product>;
  };
  subscriptions: {
    create(params: Stripe.SubscriptionCreateParams): Promise<Stripe.Subscription>;
    update(id: string, params: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription>;
    cancel(id: string): Promise<Stripe.Subscription>;
    list(params?: Stripe.SubscriptionListParams): Promise<Stripe.ApiList<Stripe.Subscription>>;
  };
  refunds: {
    create(params: Stripe.RefundCreateParams): Promise<Stripe.Refund>;
  };
  invoices: {
    pay(id: string, params?: Stripe.InvoicePayParams): Promise<Stripe.Invoice>;
  };
  customers: {
    create(params: Stripe.CustomerCreateParams): Promise<Stripe.Customer>;
    retrieve(id: string): Promise<Stripe.Customer | Stripe.DeletedCustomer>;
  };
  webhooks: {
    constructEvent(payload: string | Buffer, sig: string | string[], secret: string): Stripe.Event;
  };
}
