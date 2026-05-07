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

export interface BackendDashboardStats {
  totalRevenue: number;
  averageCart: number;
  salesByPeriod: Array<{ date: string; total: number }>;
}
