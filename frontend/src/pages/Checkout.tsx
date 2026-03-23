import React, { useMemo, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { useStripeConfig } from '@/context/StripeContext';

const DEFAULT_AMOUNT = '19.99';

const parseAmountToCents = (amountValue: string): number | null => {
  const normalized = amountValue.replace(',', '.').trim();
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
};

const formatEuro = (amountCents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amountCents / 100);

export const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { stripePromise, isConfigured } = useStripeConfig();

  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [description, setDescription] = useState(t('checkoutDefaultDescription'));
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [finalAmountCents, setFinalAmountCents] = useState<number | null>(null);

  const amountCents = useMemo(() => parseAmountToCents(amount), [amount]);

  const handleCreateIntent = async () => {
    setApiError(null);

    if (!isConfigured) {
      setApiError(t('checkoutStripeNotConfigured'));
      return;
    }

    if (!user?.id) {
      setApiError(t('checkoutUserRequired'));
      return;
    }

    if (!amountCents) {
      setApiError(t('checkoutInvalidAmount'));
      return;
    }

    setIsLoadingIntent(true);

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: amountCents,
          currency: 'eur',
          description,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || t('checkoutCreateIntentError');
        throw new Error(message);
      }

      const data = (await response.json()) as {
        clientSecret: string;
        paymentIntentId: string;
      };

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setFinalAmountCents(amountCents);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('checkoutCreateIntentError');
      setApiError(message);
    } finally {
      setIsLoadingIntent(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:w-full">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b items-center justify-center p-4">
        <Typography variant="h1" className="text-9xl font-bold text-white font-space-grotesk">
          {t('CYNA')}
        </Typography>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="lg:hidden mb-8">
          <Typography variant="h1" className="text-9xl font-bold text-gray-900 font-space-grotesk">
            {t('CYNA')}
          </Typography>
        </div>

        <div className="w-full max-w-lg space-y-6">
          <Typography variant="h2">{t('checkoutTitle')}</Typography>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Typography variant="h3" className="text-gray-900 mb-2">
              {t('checkoutOrderSummary')}
            </Typography>

            <div className="space-y-4">
              <Input
                label={t('checkoutAmountLabel')}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="19.99"
              />

              <Input
                label={t('checkoutDescriptionLabel')}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('checkoutDescriptionPlaceholder')}
              />

              <div className="rounded-lg bg-[#F5F6FB] p-3 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">{t('checkoutTotal')}</p>
                <p className="text-xl font-bold text-[#372CCA]">
                  {amountCents ? formatEuro(amountCents) : t('checkoutInvalidAmount')}
                </p>
              </div>

              {!clientSecret && (
                <Button type="button" variant="cyna" onClick={handleCreateIntent} disabled={isLoadingIntent}>
                  {isLoadingIntent ? t('checkoutCreatingIntent') : t('checkoutStartPayment')}
                </Button>
              )}
            </div>
          </div>

          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {clientSecret && paymentIntentId && finalAmountCents && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <StripePaymentForm
                amountCents={finalAmountCents}
                description={description}
                paymentIntentId={paymentIntentId}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};
