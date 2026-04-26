import { SalesRepository } from '../repository/sales.repository';
import { SaleAdminDTO } from '../dto/SaleAdminDTO';

export class SalesService {
  constructor(private readonly repo: SalesRepository) {}

  async getAll(): Promise<SaleAdminDTO[]> {
    const [orders, subscriptions] = await Promise.all([
      this.repo.findAllOrders(),
      this.repo.findAllSubscriptions(),
    ]);

    return [...orders, ...subscriptions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((row) => ({ ...row, date: row.date.toISOString() }));
  }
}
