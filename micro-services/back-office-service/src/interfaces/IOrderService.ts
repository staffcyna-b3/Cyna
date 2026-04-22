import { PaginatedResponse } from '../dto/PaginatedResponse';
import { OrderAdminDTO } from '../dto/OrderAdminDTO';

export interface IOrderService {
  getAll(page: number, limit: number): Promise<PaginatedResponse<OrderAdminDTO>>;
  getById(id: string): Promise<OrderAdminDTO>;
}
