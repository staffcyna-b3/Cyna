import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

export const CheckoutCancel: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:w-full">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b items-center justify-center p-4">
        <Typography variant="h1" className="text-9xl font-bold text-white font-space-grotesk">
          {t('CYNA')}
        </Typography>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg space-y-5 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <Typography variant="h2" className="text-amber-800">
            {t('checkoutCancelTitle')}
          </Typography>

          <p className="text-sm text-amber-900">{t('checkoutCancelMessage')}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="cyna" onClick={() => navigate('/checkout')}>
              {t('checkoutRetry')}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/')}>
              {t('checkoutBackHome')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
