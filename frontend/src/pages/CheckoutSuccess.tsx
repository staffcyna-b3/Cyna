import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { SuccessData } from '@/types/interfaces/SuccessData.interface';

const formatEuro = (amountCents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amountCents / 100);

export const CheckoutSuccess: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const resolveData = (): SuccessData => {
    if (location.state?.amount) {
      return location.state as SuccessData;
    }
    const stored = sessionStorage.getItem('checkout_success_data');
    if (stored) {
      sessionStorage.removeItem('checkout_success_data');
      return JSON.parse(stored) as SuccessData;
    }
    return { amount: 0, description: t('checkoutDefaultDescription'), paymentIntentId: 'N/A' };
  };

  const { amount, description, paymentIntentId } = resolveData();

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date()),
    [i18n.language]
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:w-full">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b items-center justify-center p-4">
        <Typography variant="h1" className="text-9xl font-bold text-white font-space-grotesk">
          {t('CYNA')}
        </Typography>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg space-y-5 rounded-xl border border-green-200 bg-green-50 p-6">
          <Typography variant="h2" className="text-green-800">
            {t('checkoutSuccessTitle')}
          </Typography>

          <p className="text-sm text-green-900">{t('checkoutSuccessMessage')}</p>

          <div className="rounded-lg border border-green-200 bg-white p-4 text-sm text-gray-800 space-y-2">
            <p>
              <strong>{t('checkoutAmountLabel')}:</strong> {amount > 0 ? formatEuro(amount) : '-'}
            </p>
            <p>
              <strong>{t('checkoutDescriptionLabel')}:</strong> {description}
            </p>
            <p>
              <strong>{t('checkoutDateLabel')}:</strong> {formattedDate}
            </p>
            <p>
              <strong>{t('checkoutOrderNumberLabel')}:</strong> {paymentIntentId}
            </p>
          </div>

          <Button type="button" variant="cyna" onClick={() => navigate('/')}>
            {t('checkoutBackHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};
