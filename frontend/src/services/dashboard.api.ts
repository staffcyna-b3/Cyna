import type { BackendDashboardStats } from './dashboard.types';

export async function fetchStats(
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
