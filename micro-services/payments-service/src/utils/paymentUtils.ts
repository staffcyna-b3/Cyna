import Stripe from 'stripe';
import { OrderStatus } from '../enum/OrderStatus.enum';
import { PAYMENT_ERRORS } from '../constants/paymentErrors';

export const toOrderStatus = (stripeStatus: string): OrderStatus => {
  if (stripeStatus === 'succeeded') return OrderStatus.SUCCESS;
  if (stripeStatus === 'canceled' || stripeStatus === 'payment_failed') return OrderStatus.ERROR;
  return OrderStatus.PENDING;
};

export const handleStripeError = (error: unknown): never => {
  if (error instanceof Stripe.errors.StripeCardError) {
    throw PAYMENT_ERRORS.CARD_ERROR(error.message);
  }
  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    throw PAYMENT_ERRORS.STRIPE_INVALID_REQUEST(error.message);
  }
  throw error;
};
