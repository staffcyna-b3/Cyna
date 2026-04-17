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
  };
  invoices: {
    pay(id: string, params?: Stripe.InvoicePayParams): Promise<Stripe.Invoice>;
  };
  customers: {
    create(params: Stripe.CustomerCreateParams): Promise<Stripe.Customer>;
    retrieve(id: string): Promise<Stripe.Customer | Stripe.DeletedCustomer>;
  };
}
