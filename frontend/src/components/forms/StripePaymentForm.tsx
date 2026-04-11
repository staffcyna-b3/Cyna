import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { StripePaymentFormProps } from '@/types/interfaces/StripePaymentFormProps.interface';
import { useAuth } from '@/hooks/useAuth';
import { createOrder, updateOrderStatus } from '@/services/orderService';
import type { LocationState } from '@/types/interfaces/LocationState.interface';

const formatEuro = (amountCents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amountCents / 100);

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amountCents,
  description,
  paymentIntentId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useTranslation();
  // TODO DESIR: replace with real auth context once gateway JWT PR is merged
  const { accessToken } = useAuth();
console.log('state passed to StripePaymentForm', state);

  // TODO: REMOVE MOCK — lier à Checkout.tsx une fois le flow complet
  const MOCK_STATE = {
    cartId: '00000000-0000-0000-0000-000000007001',
    billingAddressId: '00000000-0000-0000-0000-000000009001',
    shippingAddressId: '00000000-0000-0000-0000-000000009002',
  };
  const checkoutState = (state as LocationState) ?? MOCK_STATE; // TODO: REMOVE MOCK
  const { cartId, billingAddressId, shippingAddressId } = checkoutState;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cgvAccepted, setCgvAccepted] = useState(false);

  const handlePaymentSuccess = async () => {
    if (cartId && billingAddressId && shippingAddressId && accessToken) {
      try {
        const order = await createOrder(
          { cartId, billingAddressId, shippingAddressId, stripePaymentIntentId: paymentIntentId },
          accessToken
        );
        await updateOrderStatus(order.id, 'PAID', accessToken);
        navigate('/checkout/confirmation', { state: { order, paymentIntentId } });
        return;
      } catch (err) {
        // Le paiement a réussi — ne pas bloquer l'utilisateur
        console.error('Order creation failed after payment', err);
        // TODO: REMOVE AFTER TESTING — affichage debug temporaire
        alert(`Order creation failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
      }
    } else {
      console.error('Missing required data for createOrder:', {
        cartId,
        billingAddressId,
        shippingAddressId,
        hasToken: !!accessToken,
      });
      // TODO: REMOVE AFTER TESTING
      alert(`Missing data: cartId=${cartId} billingId=${billingAddressId} shippingId=${shippingAddressId} token=${!!accessToken}`);
    }
    // Fallback : naviguer quand même avec la référence Stripe
    navigate('/checkout/confirmation', { state: { paymentIntentId } });
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

  // if (!state?.cartId || !state?.billingAddressId || !state?.shippingAddressId) {
  //   return (
  //     <Navigate to="/checkout" replace />
  //   )
  // }

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
