import type { BackendDashboardStats } from '@/services/dashboard/dashboard.types';
import { AbstractApi } from './AbstractApi';

export class DashboardApi extends AbstractApi {
  private static instance: DashboardApi;

  private constructor() {
    super();
  }

  static getInstance(): DashboardApi {
    if (!DashboardApi.instance) {
      DashboardApi.instance = new DashboardApi();
    }
    return DashboardApi.instance;
  }

  async fetchStats(from: Date, to: Date): Promise<BackendDashboardStats> {
    const params = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    const res = await this.get<{ data: BackendDashboardStats }>(`/back-office/sales/dashboard/stats?${params}`);
    return res.data;
  }
}
