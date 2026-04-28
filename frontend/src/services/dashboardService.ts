import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';

export type TimePeriod = '7days' | '5weeks' | 'custom';

export interface KpiData {
  conversionRate: { value: number; trend: number };
  averageBasket: { value: number; trend: number };
  totalSales: { value: number; trend: number };
  nbOrders: { value: number; trend: number };
}

export interface DashboardData {
  kpis: KpiData;
  salesSeries: { date: string; total: number }[];
  categoryData: { category: string; sales: number; averageBasket: number }[];
  categories: string[];
}

const PAID_STATUSES = ['PAID', 'active'];

function getDateRange(
  period: TimePeriod,
  customFrom?: string,
  customTo?: string,
): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  if (period === '7days') {
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  if (period === '5weeks') {
    const from = new Date(to);
    from.setDate(from.getDate() - 34);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  const from = customFrom ? new Date(customFrom) : new Date(0);
  const toDate = customTo ? new Date(customTo) : to;
  toDate.setHours(23, 59, 59, 999);
  return { from, to: toDate };
}

function getPreviousRange(from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - duration - 1),
    to: new Date(from.getTime() - 1),
  };
}

function filterByRange(sales: SaleAdminDTO[], from: Date, to: Date): SaleAdminDTO[] {
  return sales.filter((s) => {
    const d = new Date(s.date);
    return d >= from && d <= to;
  });
}

function computeMetrics(sales: SaleAdminDTO[]) {
  const paid = sales.filter((s) => PAID_STATUSES.includes(s.status));
  const total = paid.reduce((sum, s) => sum + s.amount, 0);
  const count = paid.length;
  const avg = count > 0 ? total / count : 0;
  const convRate = sales.length > 0 ? (paid.length / sales.length) * 100 : 0;
  return { total, count, avg, convRate };
}

function trend(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((cur - prev) / prev) * 100 * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeKpis(current: SaleAdminDTO[], previous: SaleAdminDTO[]): KpiData {
  const cur = computeMetrics(current);
  const prev = computeMetrics(previous);
  return {
    totalSales: { value: round2(cur.total), trend: trend(cur.total, prev.total) },
    nbOrders: { value: cur.count, trend: trend(cur.count, prev.count) },
    averageBasket: { value: round2(cur.avg), trend: trend(cur.avg, prev.avg) },
    conversionRate: {
      value: Math.round(cur.convRate * 10) / 10,
      trend: trend(cur.convRate, prev.convRate),
    },
  };
}

function formatDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
}

function computeSalesSeries(
  sales: SaleAdminDTO[],
  period: TimePeriod,
  to: Date,
): { date: string; total: number }[] {
  const paid = sales.filter((s) => PAID_STATUSES.includes(s.status));

  if (period === '7days') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(to);
      d.setDate(d.getDate() - (6 - i));
      const total = paid
        .filter((s) => {
          const sd = new Date(s.date);
          return (
            sd.getDate() === d.getDate() &&
            sd.getMonth() === d.getMonth() &&
            sd.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, s) => sum + s.amount, 0);
      return { date: formatDay(d), total };
    });
  }

  if (period === '5weeks') {
    return Array.from({ length: 5 }, (_, i) => {
      const weekEnd = new Date(to);
      weekEnd.setDate(weekEnd.getDate() - (4 - i) * 7);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const total = paid
        .filter((s) => {
          const sd = new Date(s.date);
          return sd >= weekStart && sd <= weekEnd;
        })
        .reduce((sum, s) => sum + s.amount, 0);
      return { date: `Sem. ${i + 1}`, total };
    });
  }

  // custom: group by day
  const map = new Map<string, number>();
  paid.forEach((s) => {
    const label = formatDay(new Date(s.date));
    map.set(label, (map.get(label) ?? 0) + s.amount);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

function computeCategoryData(
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
    sales: round2(total),
    averageBasket: round2(total / count),
  }));
}

export function computeDashboardData(
  allSales: SaleAdminDTO[],
  period: TimePeriod,
  customFrom?: string,
  customTo?: string,
  categoryFilter?: string,
): DashboardData {
  const { from, to } = getDateRange(period, customFrom, customTo);
  const { from: prevFrom, to: prevTo } = getPreviousRange(from, to);

  const rangedSales = filterByRange(allSales, from, to);
  const prevRangedSales = filterByRange(allSales, prevFrom, prevTo);

  const currentSales = categoryFilter
    ? rangedSales.filter((s) => s.categoryNames.includes(categoryFilter))
    : rangedSales;
  const previousSales = categoryFilter
    ? prevRangedSales.filter((s) => s.categoryNames.includes(categoryFilter))
    : prevRangedSales;

  const kpis = computeKpis(currentSales, previousSales);
  const salesSeries = computeSalesSeries(currentSales, period, to);
  const categoryData = computeCategoryData(rangedSales);

  const categories = Array.from(
    new Set(allSales.flatMap((s) => s.categoryNames)),
  );

  return { kpis, salesSeries, categoryData, categories };
}
