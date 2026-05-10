import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { OrderSummary } from '@/types/interfaces/Order/OrderSummary';
import { ORDER_STATUS_VARIANT } from '@/utils/orderStatus';

interface Props {
  order: OrderSummary;
  onOrderClick: (id: string) => void;
}

export default function OrderCard({ order, onOrderClick }: Props) {
  const { t } = useTranslation();

  const productNames = order.items.map((i) => (t(`products.${i.product_name}.name`) || i.product_name)).join(', ');
  const formattedDate = new Date(order.created_at).toLocaleDateString();
  const formattedAmount = order.total_amount.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  const statusVariant = ORDER_STATUS_VARIANT[order.status] ?? 'outline';

  return (
    <div
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-xl border border-[#e0e4f8] bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md mb-3 flex items-center justify-between"
      onClick={() => onOrderClick(order.id)}
      onKeyDown={(e) => e.key === 'Enter' && onOrderClick(order.id)}
    >
      <div className="min-w-0">
        <p className="font-medium text-[#181d42] truncate">{productNames}</p>
        <p className="text-sm text-gray-500 mt-0.5">{formattedDate}</p>
        {order.billing_period && (
          <p className="text-sm text-gray-500">{t(`orders.${order.billing_period}`)}</p>
        )}
      </div>
      <div className="text-right ml-4 shrink-0">
        <p className="font-semibold text-[#181d42]">{formattedAmount}</p>
        <Badge variant={statusVariant} className="mt-1">
          {t(`orders.status.${order.status}`, { defaultValue: order.status })}
        </Badge>
        {order.promo_code && (
          <p className="text-xs text-green-600 mt-1">Code : {order.promo_code}</p>
        )}
      </div>
    </div>
  );
}
