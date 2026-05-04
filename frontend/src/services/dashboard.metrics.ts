import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import type { KpiData, TimePeriod } from './dashboard.types';
import { formatDay } from './dashboard.dateUtils';
import { toLocalIsoDate } from '@/utils/formatDate';

export const PAID_STATUSES = ['PAID', 'active'];

export const EMPTY_KPIS: KpiData = {
  conversionRate: { value: 0, trend: 0 },
  averageBasket: { value: 0, trend: 0 },
  totalSales: { value: 0, trend: 0 },
  nbOrders: { value: 0, trend: 0 },
};

export function trendPct(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((cur - prev) / prev) * 100 * 10) / 10;
}

export function computeLocalMetrics(sales: SaleAdminDTO[]) {
  const paid = sales.filter((s) => PAID_STATUSES.includes(s.status));
  const count = paid.length;
  const convRate = sales.length > 0 ? (count / sales.length) * 100 : 0;
  const totalRevenue = paid.reduce((sum, s) => sum + s.amount, 0);
  const averageCart = count > 0 ? totalRevenue / count : 0;
  return { count, convRate, totalRevenue, averageCart };
}

export function computeCategoryData(
  sales: SaleAdminDTO[],
): { category: string; sales: number; averageBasket: number }[] {
  const paid = sales.filter(
    (s) => PAID_STATUSES.includes(s.status) && s.categoryNames.length > 0,
  );
  const map = new Map<string, { total: number; count: number }>();
  paid.forEach((s) => {
    s.categoryNames.forEach((cat) => {
      const existing = map.get(cat) ?? { total: 0, count: 0 };
      map.set(cat, { total: existing.total + s.amount, count: existing.count + 1 });
    });
  });
  return Array.from(map.entries()).map(([category, { total, count }]) => ({
    category,
    sales: Math.round(total * 100) / 100,
    averageBasket: Math.round((total / count) * 100) / 100,
  }));
}

export function computeSalesSeries(
  sales: SaleAdminDTO[],
  period: TimePeriod,
  from: Date,
): { date: string; total: number }[] {
  const paid = sales.filter((s) => PAID_STATUSES.includes(s.status));

  if (period === '7days') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const iso = toLocalIsoDate(d);
      const total = paid
        .filter((s) => toLocalIsoDate(new Date(s.date)) === iso)
        .reduce((sum, s) => sum + s.amount, 0);
      return { date: formatDay(d), total };
    });
  }

  if (period === '5weeks') {
    return Array.from({ length: 5 }, (_, i) => {
      const weekStart = new Date(from);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const total = paid
        .filter((s) => {
          const sd = new Date(s.date);
          return sd >= weekStart && sd <= weekEnd;
        })
        .reduce((sum, s) => sum + s.amount, 0);
      return { date: `Sem. ${i + 1}`, total };
    });
  }

  const map = new Map<string, { total: number; label: string }>();
  paid.forEach((s) => {
    const d = new Date(s.date);
    const iso = toLocalIsoDate(d);
    const existing = map.get(iso);
    map.set(iso, { total: (existing?.total ?? 0) + s.amount, label: formatDay(d) });
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { label, total }]) => ({ date: label, total }));
}
