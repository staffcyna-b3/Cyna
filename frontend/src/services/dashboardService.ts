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

// Format de réponse du backend GET /sales/dashboard/stats
interface BackendDashboardStats {
  totalRevenue: number;
  averageCart: number;
  salesByPeriod: Array<{ date: string; total: number }>;
}

const PAID_STATUSES = ['PAID', 'active'];

// ─── Helpers de dates ──────────────────────────────────────────────────────

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

// ─── Appel backend ─────────────────────────────────────────────────────────

async function fetchStats(
  token: string,
  from: Date,
  to: Date,
): Promise<BackendDashboardStats> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const res = await fetch(`/api/back-office/sales/dashboard/stats?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des statistiques du tableau de bord.');
  return (await res.json()).data as BackendDashboardStats;
}

// ─── Construction de la série temporelle (locale, respecte le filtre catégorie) ──

function formatDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
}

// Calcule la série depuis les ventes déjà filtrées (date + catégorie)
// afin que le graphique "ventes par jour" réagisse bien au filtre catégorie
function computeSalesSeries(
  sales: SaleAdminDTO[],
  period: TimePeriod,
  from: Date,
): { date: string; total: number }[] {
  const paid = sales.filter((s) => PAID_STATUSES.includes(s.status));

  if (period === '7days') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const total = paid
        .filter((s) => new Date(s.date).toISOString().slice(0, 10) === iso)
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

  // custom : regroupement par jour
  const map = new Map<string, number>();
  paid.forEach((s) => {
    const label = formatDay(new Date(s.date));
    map.set(label, (map.get(label) ?? 0) + s.amount);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

// ─── Calculs locaux (métriques non fournies par le backend) ────────────────

function computeLocalMetrics(sales: SaleAdminDTO[]) {
  const paid = sales.filter((s) => PAID_STATUSES.includes(s.status));
  const count = paid.length;
  const convRate = sales.length > 0 ? (count / sales.length) * 100 : 0;
  return { count, convRate };
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
    sales: Math.round(total * 100) / 100,
    averageBasket: Math.round((total / count) * 100) / 100,
  }));
}

function trendPct(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((cur - prev) / prev) * 100 * 10) / 10;
}

// ─── Export principal ──────────────────────────────────────────────────────

const EMPTY_KPIS: KpiData = {
  conversionRate: { value: 0, trend: 0 },
  averageBasket: { value: 0, trend: 0 },
  totalSales: { value: 0, trend: 0 },
  nbOrders: { value: 0, trend: 0 },
};

export async function computeDashboardData(
  token: string,
  allSales: SaleAdminDTO[],
  period: TimePeriod,
  customFrom?: string,
  customTo?: string,
  categoryFilter?: string,
): Promise<DashboardData> {
  // En mode personnalisé, attendre que les deux dates soient saisies
  if (period === 'custom' && (!customFrom || !customTo)) {
    const categories = Array.from(new Set(allSales.flatMap((s) => s.categoryNames)));
    return { kpis: EMPTY_KPIS, salesSeries: [], categoryData: [], categories };
  }

  const { from, to } = getDateRange(period, customFrom, customTo);

  // Plage incohérente (ex : saisie partielle de l'année dans le datepicker)
  if (from >= to) {
    const categories = Array.from(new Set(allSales.flatMap((s) => s.categoryNames)));
    return { kpis: EMPTY_KPIS, salesSeries: [], categoryData: [], categories };
  }

  const { from: prevFrom, to: prevTo } = getPreviousRange(from, to);

  // Le filtrage par date est délégué au backend
  const [currentStats, prevStats] = await Promise.all([
    fetchStats(token, from, to),
    fetchStats(token, prevFrom, prevTo),
  ]);

  // Filtrage local uniquement pour les métriques que le backend ne calcule pas
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
