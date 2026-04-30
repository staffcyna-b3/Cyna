export type TimePeriod = '7days' | '5weeks' | 'custom';

export interface KpiData {
  conversionRate: { value: number; trend: number };
  averageBasket: { value: number; trend: number };
  totalSales: { value: number; trend: number };
  nbOrders: { value: number; trend: number };
}

export interface PeriodData {
  kpis: KpiData;
  salesSeries: { date: string; total: number }[];
  categoryData: { category: string; sales: number; averageBasket: number }[];
}

export const mockDashboardData: Record<TimePeriod, PeriodData> = {
  '7days': {
    kpis: {
      conversionRate: { value: 3.4, trend: -0.5 },
      averageBasket: { value: 4200, trend: 0.5 },
      totalSales: { value: 31200, trend: -0.5 },
      nbOrders: { value: 248, trend: -0.5 },
    },
    salesSeries: [
      { date: '01/02/26', total: 5000 },
      { date: '02/02/26', total: 4500 },
      { date: '03/02/26', total: 5500 },
      { date: '04/02/26', total: 3000 },
      { date: '05/02/26', total: 4000 },
      { date: '06/02/26', total: 4600 },
      { date: '07/02/26', total: 4600 },
    ],
    categoryData: [
      { category: 'EDR', sales: 12000, averageBasket: 5000 },
      { category: 'SOC', sales: 8000, averageBasket: 3500 },
      { category: 'XDR', sales: 9000, averageBasket: 4600 },
      { category: 'OT', sales: 2200, averageBasket: 4600 },
    ],
  },
  '5weeks': {
    kpis: {
      conversionRate: { value: 3.8, trend: 1.2 },
      averageBasket: { value: 4500, trend: 2.1 },
      totalSales: { value: 148000, trend: 3.4 },
      nbOrders: { value: 1120, trend: 1.8 },
    },
    salesSeries: [
      { date: 'Sem. 1', total: 28000 },
      { date: 'Sem. 2', total: 31000 },
      { date: 'Sem. 3', total: 29000 },
      { date: 'Sem. 4', total: 33000 },
      { date: 'Sem. 5', total: 27000 },
    ],
    categoryData: [
      { category: 'EDR', sales: 52000, averageBasket: 5200 },
      { category: 'SOC', sales: 38000, averageBasket: 3800 },
      { category: 'XDR', sales: 42000, averageBasket: 4700 },
      { category: 'OT', sales: 16000, averageBasket: 4400 },
    ],
  },
  custom: {
    kpis: {
      conversionRate: { value: 0, trend: 0 },
      averageBasket: { value: 0, trend: 0 },
      totalSales: { value: 0, trend: 0 },
      nbOrders: { value: 0, trend: 0 },
    },
    salesSeries: [],
    categoryData: [],
  },
};
