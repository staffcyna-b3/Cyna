import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { TrendingUp, TrendingDown, Percent, Euro, ShoppingCart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSales, BackOfficeApiError } from "@/services/BackOfficeOrderService";
import { computeDashboardData, type TimePeriod, type DashboardData } from "@/services/dashboardService";
import type { SaleAdminDTO } from "@/types/interfaces/admin/SaleAdminDTO.interface";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHART_COLOR = "#4F46E5";
const DONUT_COLORS = ["#818CF8", "#4F46E5", "#1E3A8A", "#7C6FCD"];
const ALL_CATEGORIES_VALUE = "__all_categories__";

const baseBarOptions: ApexOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "inherit",
  },
  plotOptions: {
    bar: { borderRadius: 4, columnWidth: "55%" },
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: "#F1F1F1",
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  colors: [CHART_COLOR],
  xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: "#9CA3AF" } } },
  tooltip: { y: { formatter: (val) => `${val.toLocaleString("fr-FR")} €` } },
};

interface KpiCardProps {
  label: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
}

function KpiCard({ label, value, trend, icon }: KpiCardProps) {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-xs">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>("7days");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [allSales, setAllSales] = useState<SaleAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    kpis: {
      conversionRate: { value: 0, trend: 0 },
      averageBasket: { value: 0, trend: 0 },
      totalSales: { value: 0, trend: 0 },
      nbOrders: { value: 0, trend: 0 },
    },
    salesSeries: [],
    categoryData: [],
    categories: [],
  });

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    getSales(accessToken)
      .then(setAllSales)
      .catch((err: unknown) => {
        if (err instanceof BackOfficeApiError && err.status === 401) {
          toast.error(t("sessionExpired"));
        } else {
          toast.error(t("errorOccurred"));
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    computeDashboardData(
      accessToken,
      allSales,
      period,
      customFrom || undefined,
      customTo || undefined,
      categoryFilter || undefined,
    )
      .then(setDashboardData)
      .catch(() => toast.error(t("errorOccurred")));
      console.log("Test", allSales);
  }, [accessToken, allSales, period, customFrom, customTo, categoryFilter]);

  const { kpis, salesSeries, categoryData, categories } = dashboardData;
  console.log("Dashboard data:", salesSeries);
  const salesBarOptions: ApexOptions = {
    ...baseBarOptions,
    xaxis: {
      ...baseBarOptions.xaxis,
      categories: salesSeries.map((d) => d.date),
      labels: { style: { colors: "#9CA3AF" } },
    },
  };

  const avgBasketBarOptions: ApexOptions = {
    ...baseBarOptions,
    xaxis: {
      ...baseBarOptions.xaxis,
      categories: categoryData.map((d) => d.category),
      labels: { style: { colors: "#9CA3AF" } },
    },
  };

  const donutOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    colors: DONUT_COLORS,
    labels: categoryData.map((d) => d.category),
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      markers: { offsetX: -4 },
      labels: { colors: "#374151" },
    },
    plotOptions: {
      pie: { donut: { size: "65%" } },
    },
    tooltip: { y: { formatter: (val) => `${val.toLocaleString("fr-FR")} €` } },
  };

  return (
    <>
      <header className="px-6 flex flex-col sm:flex-row sm:h-16 shrink-0 sm:items-center gap-3 py-3 sm:py-0 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SidebarTrigger className="md:hidden -ml-1" />
          <Typography variant="h1">{t("dashboard")}</Typography>
          {categories.length > 0 && (
            <Select
              value={categoryFilter || ALL_CATEGORIES_VALUE}
              onValueChange={(value) => setCategoryFilter(value === ALL_CATEGORIES_VALUE ? "" : value)}
            >
              <SelectTrigger className="min-w-52 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>{t("allCategories") || "Toutes les catégories"}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-primary rounded-full p-1">
            <Button
              variant={period === "7days" ? "selected" : "notSelected"}
              onClick={() => setPeriod("7days")}
            >
              {t("last7Days")}
            </Button>
            <Button
              variant={period === "5weeks" ? "selected" : "notSelected"}
              onClick={() => setPeriod("5weeks")}
            >
              {t("last5Weeks")}
            </Button>
            <Button
              variant={period === "custom" ? "selected" : "notSelected"}
              onClick={() => setPeriod("custom")}
            >
              {t("custom")}
            </Button>
          </div>
        </div>
      </header>

      {period === "custom" && (
        <div className="px-6 pb-2 flex items-center gap-3">
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="w-auto"
          />
          <span className="text-gray-400 text-sm">→</span>
          <Input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="w-auto"
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          {t("loading")}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-5 px-6 pb-6 pt-0">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label={t("conversionRate")}
              value={`${kpis.conversionRate.value}%`}
              trend={kpis.conversionRate.trend}
              icon={<Percent size={16} />}
            />
            <KpiCard
              label={t("averageBasket")}
              value={`${kpis.averageBasket.value.toLocaleString("fr-FR")} €`}
              trend={kpis.averageBasket.trend}
              icon={<ShoppingBag size={16} />}
            />
            <KpiCard
              label={t("totalSales")}
              value={`${kpis.totalSales.value.toLocaleString("fr-FR")} €`}
              trend={kpis.totalSales.trend}
              icon={<Euro size={16} />}
            />
            <KpiCard
              label={t("nbOrders")}
              value={kpis.nbOrders.value.toLocaleString("fr-FR")}
              trend={kpis.nbOrders.trend}
              icon={<ShoppingCart size={16} />}
            />
          </div>

          {/* Total ventes par jour */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <Typography variant="h3" className="mb-4">
              {t("totalSalesPerDay")}
            </Typography>
            <ReactApexChart
              options={salesBarOptions}
              series={[{ name: t("totalSales"), data: salesSeries.map((d) => d.total) }]}
              type="bar"
              height={280}
            />
          </div>

          {/* Ventes par catégorie + Panier moyen par catégorie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <Typography variant="h3" className="mb-4">
                {t("salesByCategory")}
              </Typography>
              {categoryData.length > 0 ? (
                <ReactApexChart
                  options={donutOptions}
                  series={categoryData.map((d) => d.sales)}
                  type="donut"
                  height={280}
                />
              ) : (
                <div className="flex items-center justify-center h-70 text-gray-400 text-sm">
                  {t("noData") || "Aucune donnée"}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <Typography variant="h3" className="mb-4">
                {t("avgBasketByCategory")}
              </Typography>
              {categoryData.length > 0 ? (
                <ReactApexChart
                  options={avgBasketBarOptions}
                  series={[{ name: t("averageBasket"), data: categoryData.map((d) => d.averageBasket) }]}
                  type="bar"
                  height={280}
                />
              ) : (
                <div className="flex items-center justify-center h-70 text-gray-400 text-sm">
                  {t("noData") || "Aucune donnée"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
