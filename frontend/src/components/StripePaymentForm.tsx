import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  const [cgvAccepted, setCgvAccepted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage(t('checkoutStripeLoading'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const successData = { amount: amountCents, description, paymentIntentId };
    sessionStorage.setItem('checkout_success_data', JSON.stringify(successData));

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      sessionStorage.removeItem('checkout_success_data');
      setErrorMessage(result.error.message || t('checkoutPaymentError'));
      setIsSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      navigate('/checkout/success', { state: successData });
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
