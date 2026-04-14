import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { StripePaymentFormProps } from '@/types/interfaces/StripePaymentFormProps.interface';
import { useAuth } from '@/hooks/useAuth';
import useCart from '@/hooks/useCart';
import { createOrder, updateOrderStatus } from '@/services/orderService';

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  paymentIntentId,
  cartId,
  billingAddressId,
  shippingAddressId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const { fetchCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cgvAccepted, setCgvAccepted] = useState(false);

  const handlePaymentSuccess = async () => {
    let order = null;

    if (cartId && billingAddressId && shippingAddressId && accessToken) {
      try {
        order = await createOrder(
          { cartId, billingAddressId, shippingAddressId, stripePaymentIntentId: paymentIntentId },
          accessToken
        );
        await updateOrderStatus(order.id, 'PAID', accessToken);
      } catch (err) {
        // Payment succeeded — don't block the user, log and fall through to confirmation
        console.error('[Payment] Order creation/update failed after payment:', err);
      }
    } else {
      console.error('[Payment] Missing required data for createOrder:', {
        cartId,
        billingAddressId,
        shippingAddressId,
        hasToken: !!accessToken,
      });
    }

    // Toujours resynchroniser le panier après paiement (qu'il ait été vidé en DB ou non)
    await fetchCart();
    navigate('/checkout/confirmation', { state: { order, paymentIntentId } });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage(t('checkoutStripeLoading'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setErrorMessage(result.error.message || t('checkoutPaymentError'));
      setIsSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      await handlePaymentSuccess();
      return;
    }

    if (result.paymentIntent?.status === 'processing') {
      setErrorMessage(t('checkoutPaymentProcessing'));
    } else {
      setErrorMessage(t('checkoutPaymentUnknownState'));
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={cgvAccepted}
          onChange={(e) => setCgvAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#372CCA] shrink-0"
        />
        <span className="text-sm text-gray-600">
          {t('acceptCGV')}{' '}
          <Link to="/cgv" className="underline text-gray-800 hover:text-[#372CCA]">
            {t('termsAndConditions')}
          </Link>{' '}
          {t('SalesContract')}
        </span>
      </label>

      <Button
        type="submit"
        variant="cyna"
        disabled={isSubmitting || !stripe || !elements || !cgvAccepted}
      >
        {isSubmitting ? t('checkoutProcessing') : t('checkoutPay')}
      </Button>
    </form>
  );
};
