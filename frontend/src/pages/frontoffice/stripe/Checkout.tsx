import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { StripePaymentForm } from '@/components/forms/StripePaymentForm';
import { useStripeConfig } from '@/contexts/StripeContext';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/interfaces/cart/CartItem';
import { LocationState } from '@/types/interfaces/LocationState.interface';
import { CartService } from '@/services/CartService';

const formatEuro = (amountCents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amountCents / 100);

export const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();
  const { stripePromise, isConfigured } = useStripeConfig();
  const location = useLocation();

  const locationState = location.state as LocationState ?? {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cartItems = useMemo(() => locationState.cartItems ?? [], []);
  const billingAddress = locationState.billingAddress ?? null;
  const cartId = locationState.cartId ?? null;
  const billingAddressId = locationState.billingAddressId ?? null;
  const shippingAddressId = locationState.shippingAddressId ?? null;
  const shippingFeeCents = Math.round((locationState.shippingFee ?? 0) * 100);

  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | undefined>(undefined);
  const [discountCents, setDiscountCents] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const result = await CartService.getInstance().applyPromo(promoInput.trim());
      setPromoCode(result.promoCode);
      setDiscountCents(Math.round(result.discountAmount * 100));
      resetIntent();
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : t('promoError'));
      setPromoCode(undefined);
      setDiscountCents(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(undefined);
    setDiscountCents(0);
    setPromoInput('');
    setPromoError(null);
    resetIntent();
  };

  const subscriptionItems = useMemo(() => cartItems.filter((i) => i.isRecurring), [cartItems]);
  const oneTimeItems = useMemo(() => cartItems.filter((i) => !i.isRecurring), [cartItems]);
  const hasSubscription = subscriptionItems.length > 0;

  const totalCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [cartItems],
  );

  const recurringCents = useMemo(
    () => subscriptionItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [subscriptionItems],
  );

  const oneTimeCents = useMemo(
    () => oneTimeItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [oneTimeItems],
  );

  const effectiveAmountCents = useMemo(
    () => Math.max(0, totalCents + shippingFeeCents - discountCents),
    [totalCents, shippingFeeCents, discountCents],
  );

  const hasCreatedIntent = useRef(false);
  const [intentVersion, setIntentVersion] = useState(0);

  const resetIntent = () => {
    setClientSecret(null);
    setPaymentIntentId(null);
    hasCreatedIntent.current = false;
    setIntentVersion((v) => v + 1);
  };

  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured || !user?.id || !accessToken || effectiveAmountCents <= 0) return;
    if (hasCreatedIntent.current) return;
    hasCreatedIntent.current = true;

    const createIntent = async () => {
      setIsLoadingIntent(true);
      setApiError(null);
      try {
        let response: Response;

        if (hasSubscription) {
          response = await fetch('/api/payments/create-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              subscriptionItems: subscriptionItems.map((i) => ({
                productId: i.id,
                priceAmountCents: i.unitPriceCents,
                currency: 'eur',
                description: i.name,
                billingPeriod: i.billingPeriod ?? 'monthly',
                quantity: i.quantity,
              })),
              oneTimeAmountCents: oneTimeCents,
              oneTimeDescription: oneTimeItems.map((i) => i.name).join(', '),
              userEmail: user.email,
            }),
          });
        } else {
          response = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              amount: totalCents,
              currency: 'eur',
              description: cartItems.map((i) => i.name).join(', '),
              userId: user.id,
            }),
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || t('checkoutCreateIntentError'));
        }

        const data = (await response.json()) as { clientSecret: string; paymentIntentId: string };
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : t('checkoutCreateIntentError'));
      } finally {
        setIsLoadingIntent(false);
      }
    };

    createIntent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, user?.id, accessToken, effectiveAmountCents, intentVersion]);

  // console.log('Checkout state:', { clientSecret, paymentIntentId, stripePromise });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-width header */}
      {/* <div className="w-full bg-white border-b border-gray-200 px-8 lg:px-12 py-5">
        <Typography variant="h2" className="!text-left !pb-0 text-[#372CCA]">
          {t('Cyna')}
        </Typography>
      </div> */}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left panel â€” form */}
        <div className="w-full lg:w-3/5 bg-white flex flex-col p-8 lg:p-12">
          {/* Contact */}
          <div className="mb-8">
            <Typography variant="h2" className="text-xl font-bold text-gray-900 mb-4">
              {t('Contact')}
            </Typography>
            {isAuthLoading ? (
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 animate-pulse">
                {t('loading')}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-1">
                {billingAddress && (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {[billingAddress.firstName, billingAddress.lastName].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-sm text-gray-600">{billingAddress.addressLine1}</p>
                    <p className="text-sm text-gray-600">
                      {[billingAddress.postcode, billingAddress.city, billingAddress.country].filter(Boolean).join(' ')}
                    </p>
                    <div className="border-t border-gray-100 my-2" />
                  </>
                )}
                <p className="text-sm text-gray-700">{user?.email ?? ''}</p>
              </div>
            )}
          </div>

          {/* Payment */}
          <div>
            <Typography variant="h2" className="text-xl font-bold text-gray-900 mb-4">{t('Payment')}</Typography>

            {apiError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            {isLoadingIntent && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
                {t('checkoutCreatingIntent')}
              </div>
            )}

            {clientSecret && paymentIntentId && stripePromise && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <StripePaymentForm
                  amountCents={totalCents}
                  description={cartItems.map((i) => i.name).join(', ')}
                  paymentIntentId={paymentIntentId}
                  cartId={cartId}
                  billingAddressId={billingAddressId}
                  shippingAddressId={shippingAddressId}
                  promoCode={promoCode}
                />
              </Elements>
            )}
          </div>
        </div>

        {/* Right panel â€” order summary */}
        <div className="w-full lg:w-2/5 bg-gray-50 border-l border-gray-200 p-8 lg:p-12">
          <div className="space-y-5">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">{item.name[0]}</span>
                    )}
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#372CCA] text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.isRecurring && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t('Billed')} {item.billingPeriod === 'yearly' ? t('yearly') : t('monthly')}
                    </p>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  {formatEuro(item.unitPriceCents * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {cartItems.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200" />

              {/* Promo code */}
              <div className="mb-4">
                {promoCode ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                    <span>Code <strong>{promoCode}</strong> appliqué</span>
                    <button onClick={handleRemovePromo} className="ml-3 text-green-600 underline text-xs">{t('remove')}</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder={t('promoPlaceholder')}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#372CCA]"
                    />
                    <Button onClick={handleApplyPromo} disabled={promoLoading} variant="outline" size="sm">
                      {promoLoading ? '...' : t('apply')}
                    </Button>
                  </div>
                )}
                {promoError && <p className="mt-1 text-xs text-red-500">{promoError}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{t('subtotal')}</span>
                  <span className="text-xs text-gray-500">{formatEuro(totalCents)}</span>
                </div>
                {shippingFeeCents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{t('shipping')}</span>
                    <span className="text-xs text-gray-500">{formatEuro(shippingFeeCents)}</span>
                  </div>
                )}
                {discountCents > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-xs">{t('discount') || 'Réduction'} ({promoCode})</span>
                    <span className="text-xs">-{formatEuro(discountCents)}</span>
                  </div>
                )}
                {recurringCents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{t('Recurring')}</span>
                    <span className="text-xs text-gray-500">
                      {formatEuro(recurringCents)} {t('perMonth')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900">{t('Total')}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatEuro(totalCents + shippingFeeCents - discountCents)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
