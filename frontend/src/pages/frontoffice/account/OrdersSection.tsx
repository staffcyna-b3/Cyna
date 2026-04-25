import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { OrderSummary } from '@/types/interfaces/Order/OrderSummary';
import type { OrderDetail } from '@/types/interfaces/Order/OrderDetail';
import { getOrders, getOrderById, OrderApiError } from '@/services/orderService';
import OrdersFilters from '../orders/OrdersFilters';
import OrdersByYear from '../orders/OrdersByYear';
import OrderDetailModal from '../orders/OrderDetailModal';

interface OrdersSectionProps {
  token: string;
}

export function OrdersSection({ token }: OrdersSectionProps) {
  const { t } = useTranslation();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getOrders(token)
      .then(setOrders)
      .catch((err: unknown) => {
        if (err instanceof OrderApiError && err.status === 401) {
          toast.error(t('sessionExpired'));
        } else {
          toast.error(t('errorOccurred'));
        }
      })
      .finally(() => setLoading(false));
  }, [token, t]);

  async function handleOrderClick(orderId: string) {
    setDetailLoading(true);
    setDetailOpen(true);
    setSelectedOrder(null);
    try {
      const detail = await getOrderById(token, orderId);
      setSelectedOrder(detail);
    } catch (err: unknown) {
      if (err instanceof OrderApiError && err.status === 401) {
        toast.error(t('sessionExpired'));
      } else {
        toast.error(t('errorOccurred'));
      }
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const date = new Date(order.created_at);
    if (selectedYear !== null && date.getFullYear() !== selectedYear) return false;
    if (selectedMonth !== null && date.getMonth() + 1 !== selectedMonth) return false;
    return true;
  });

  const years = [...new Set(
    filteredOrders.map((o) => new Date(o.created_at).getFullYear())
  )].sort((a, b) => b - a);

  const byYear = years.reduce<Record<number, OrderSummary[]>>((acc, year) => {
    acc[year] = filteredOrders.filter(
      (o) => new Date(o.created_at).getFullYear() === year
    );
    return acc;
  }, {});

  return (
    <>
      <OrdersFilters
        orders={orders}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <p className="text-gray-500 text-center py-12">{t('orders.noOrders')}</p>
      )}

      {!loading && years.map((year) => (
        <OrdersByYear
          key={year}
          year={year}
          orders={byYear[year]}
          onOrderClick={handleOrderClick}
        />
      ))}

      <OrderDetailModal
        open={detailOpen}
        loading={detailLoading}
        order={selectedOrder}
        onClose={() => {
          setDetailOpen(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
}
