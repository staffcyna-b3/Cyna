import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import type { TimePeriod, KpiData, DashboardData } from './dashboard.types';
import { getDateRange, getPreviousRange, filterByRange } from './dashboard.dateUtils';
import { fetchStats } from './dashboard.api';
import {
  EMPTY_KPIS,
  trendPct,
  computeLocalMetrics,
  computeCategoryData,
  computeSalesSeries,
} from './dashboard.metrics';

export type { TimePeriod, KpiData, DashboardData } from './dashboard.types';

export async function computeDashboardData(
  token: string,
  allSales: SaleAdminDTO[],
  period: TimePeriod,
  customFrom?: string,
  customTo?: string,
  categoryFilter?: string,
): Promise<DashboardData> {
  if (period === 'custom' && (!customFrom || !customTo)) {
    const categories = Array.from(new Set(allSales.flatMap((s) => s.categoryNames)));
    return { kpis: EMPTY_KPIS, salesSeries: [], categoryData: [], categories };
  }

  const { from, to } = getDateRange(period, customFrom, customTo);

  if (from >= to) {
    const categories = Array.from(new Set(allSales.flatMap((s) => s.categoryNames)));
    return { kpis: EMPTY_KPIS, salesSeries: [], categoryData: [], categories };
  }

  const { from: prevFrom, to: prevTo } = getPreviousRange(from, to);

  const [currentStats, prevStats] = await Promise.all([
    fetchStats(token, from, to),
    fetchStats(token, prevFrom, prevTo),
  ]);

  const rangedSales = filterByRange(allSales, from, to);
  const prevRangedSales = filterByRange(allSales, prevFrom, prevTo);

  const currentFiltered = categoryFilter
    ? rangedSales.filter((s) => s.categoryNames.includes(categoryFilter))
    : rangedSales;
  const prevFiltered = categoryFilter
    ? prevRangedSales.filter((s) => s.categoryNames.includes(categoryFilter))
    : prevRangedSales;

  const curLocal = computeLocalMetrics(currentFiltered);
  const prevLocal = computeLocalMetrics(prevFiltered);

  const kpis: KpiData = {
    totalSales: {
      value: Math.round(currentStats.totalRevenue * 100) / 100,
      trend: trendPct(currentStats.totalRevenue, prevStats.totalRevenue),
    },
    averageBasket: {
      value: Math.round(currentStats.averageCart * 100) / 100,
      trend: trendPct(currentStats.averageCart, prevStats.averageCart),
    },
    nbOrders: {
      value: curLocal.count,
      trend: trendPct(curLocal.count, prevLocal.count),
    },
    conversionRate: {
      value: Math.round(curLocal.convRate * 10) / 10,
      trend: trendPct(curLocal.convRate, prevLocal.convRate),
    },
  };

  const salesSeries = computeSalesSeries(currentFiltered, period, from);
  const categoryData = computeCategoryData(rangedSales);
  const categories = Array.from(new Set(allSales.flatMap((s) => s.categoryNames)));

  return { kpis, salesSeries, categoryData, categories };
}
