import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface StripePaymentFormProps {
  amountCents: number;
  description: string;
  paymentIntentId: string;
}

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
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage(t('checkoutStripeLoading'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const query = new URLSearchParams({
      amount: String(amountCents),
      description,
      paymentIntentId,
    });

    const returnUrl = `${window.location.origin}/checkout/success?${query.toString()}`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setErrorMessage(result.error.message || t('checkoutPaymentError'));
      setIsSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      navigate(`/checkout/success?${query.toString()}`);
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" variant="cyna" disabled={isSubmitting || !stripe || !elements}>
          {isSubmitting
            ? t('checkoutProcessing')
            : t('checkoutPayButton', { amount: formatEuro(amountCents) })}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => navigate('/checkout/cancel')}
        >
          {t('checkoutCancel')}
        </Button>
      </div>
    </form>
  );
};
