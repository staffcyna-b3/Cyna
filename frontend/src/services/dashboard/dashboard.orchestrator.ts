import type { SaleAdminDTO } from '@/types/interfaces/admin/SaleAdminDTO.interface';
import type { TimePeriod, KpiData, DashboardData } from './dashboard.types';
import { getDateRange, getPreviousRange, filterByRange } from './dashboard.dateUtils';
import { DashboardApi } from '@/api/DashboardApi';
import {
  EMPTY_KPIS,
  trendPct,
  computeLocalMetrics,
  computeCategoryData,
  computeSalesSeries,
} from './dashboard.metrics';

export type { TimePeriod, KpiData, DashboardData } from './dashboard.types';

export async function computeDashboardData(
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

  const api = DashboardApi.getInstance();
  const [currentStats, prevStats] = await Promise.all([
    api.fetchStats(from, to),
    api.fetchStats(prevFrom, prevTo),
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

  const curRevenue = categoryFilter ? curLocal.totalRevenue : currentStats.totalRevenue;
  const prevRevenue = categoryFilter ? prevLocal.totalRevenue : prevStats.totalRevenue;
  const curAvgCart = categoryFilter ? curLocal.averageCart : currentStats.averageCart;
  const prevAvgCart = categoryFilter ? prevLocal.averageCart : prevStats.averageCart;

  const kpis: KpiData = {
    totalSales: {
      value: Math.round(curRevenue * 100) / 100,
      trend: trendPct(curRevenue, prevRevenue),
    },
    averageBasket: {
      value: Math.round(curAvgCart * 100) / 100,
      trend: trendPct(curAvgCart, prevAvgCart),
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
