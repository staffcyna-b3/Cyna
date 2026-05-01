import { SaleAdminDTO } from '../dto/SaleAdminDTO';
import { DashboardStats } from './SalesService';

export interface ISalesService {
  getAll(): Promise<SaleAdminDTO[]>;
  getDashboardStats(from?: Date, to?: Date): Promise<DashboardStats>;
}
