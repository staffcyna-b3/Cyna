import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { OrdersSection } from './account/OrdersSection';

export default function OrdersPage() {
  const { t } = useTranslation();
  const { accessToken, isLoading } = useAuth();

  if (!accessToken && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !accessToken) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-[#372cca]">
        {t('orders.pageTitle')}
      </h1>
      <OrdersSection token={accessToken} />
    </div>
  );
}
