import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrderSummary } from '@/services/orderService';

interface Props {
  orders: OrderSummary[];
  selectedYear: number | null;
  selectedMonth: number | null;
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void;
}

export default function OrdersFilters({
  orders,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: Props) {
  const { t } = useTranslation();

  const availableYears = [...new Set(
    orders.map((o) => new Date(o.created_at).getFullYear())
  )].sort((a, b) => b - a);

  return (
    <div className="flex gap-3 mb-6">
      <Select
        value={selectedYear?.toString() ?? 'all'}
        onValueChange={(v) => {
          onYearChange(v === 'all' ? null : Number(v));
          onMonthChange(null);
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('orders.allYears')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('orders.allYears')}</SelectItem>
          {availableYears.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedYear !== null && (
        <Select
          value={selectedMonth?.toString() ?? 'all'}
          onValueChange={(v) => onMonthChange(v === 'all' ? null : Number(v))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('orders.allMonths')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('orders.allMonths')}</SelectItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
