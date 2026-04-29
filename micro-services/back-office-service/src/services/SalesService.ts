import { SaleAdminDTO } from '../dto/SaleAdminDTO';
import { ISalesRepository} from '../repository/ISalesRepository';
import { SaleRow } from '../interfaces/SaleRow.interface';

export interface DashboardStats {
  totalRevenue: number;
  averageCart: number;
  salesByPeriod: Array<{ date: string; total: number }>;
}

export class SalesService {
  constructor(private readonly repo: ISalesRepository) {}

  async getAll(): Promise<SaleAdminDTO[]> {
    const [orders, subscriptions] = await Promise.all([
      this.repo.findAllOrders(),
      this.repo.findAllSubscriptions(),
    ]);

    return [...orders, ...subscriptions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((row) => this.toSaleAdminDTO(row));
  }

  async getDashboardStats(from?: Date, to?: Date): Promise<DashboardStats> {
    const [rangeFrom, rangeTo] = this.resolveDateRange(from, to);
    const [orders, subscriptions] = await Promise.all([
      this.repo.findAllOrders({ from: rangeFrom, to: rangeTo }),
      this.repo.findAllSubscriptions({ from: rangeFrom, to: rangeTo }),
    ]);
    const rangedSales = [...orders, ...subscriptions];

    // Seules les ventes validées (PAID pour les commandes, active pour les abonnements)
    const VALID_STATUSES = ['PAID', 'active'];
    const paidSales = rangedSales.filter((row) => VALID_STATUSES.includes(row.status));

    const totalRevenue = paidSales.reduce((sum, row) => sum + row.amount, 0);
    const averageCart = paidSales.length > 0 ? totalRevenue / paidSales.length : 0;
    const salesByPeriod = this.groupSalesByDay(paidSales);

    return { totalRevenue, averageCart, salesByPeriod };
  }

  private toSaleAdminDTO(row: SaleRow): SaleAdminDTO {
    return {
      id: row.id,
      date: row.date.toISOString(),
      userEmail: row.userEmail,
      productName: this.formatProductName(row.productNames),
      categoryNames: row.categoryNames,
      type: row.type,
      amount: row.amount,
      status: row.status,
    };
  }

  private formatProductName(productNames: Array<string | null>): string {
    const cleaned = productNames
      .map((name) => name?.trim() ?? '')
      .filter((name) => name.length > 0);

    if (cleaned.length === 0) {
      return '—';
    }

    return cleaned.join(', ');
  }

  private resolveDateRange(from?: Date, to?: Date): [Date, Date] {
    const rangeTo = to ?? new Date();
    const rangeFrom = from ? new Date(from) : new Date(rangeTo);
    if (!from) {
      rangeFrom.setDate(rangeTo.getDate() - 30);
    }
    return [rangeFrom, rangeTo];
  }

  private groupSalesByDay(rows: SaleRow[]): Array<{ date: string; total: number }> {
    const totalsByDate = new Map<string, number>();

    rows.forEach((row) => {
      const dateKey = row.date.toISOString().slice(0, 10);
      totalsByDate.set(dateKey, (totalsByDate.get(dateKey) ?? 0) + row.amount);
    });

    return Array.from(totalsByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }
}
