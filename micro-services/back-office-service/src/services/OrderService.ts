import { IOrderRepository, OrderWithItems } from '../interfaces/IOrderRepository';
import { IOrderService } from '../interfaces/IOrderService';
import { PaginatedResponse } from '../dto/PaginatedResponse';
import { OrderAdminDTO } from '../dto/OrderAdminDTO';
import { OrderStatus } from '../enum/OrderStatus';
import { toOrderAdminDTO } from '../dto/mapper/OrderMapper';

export class OrderService implements IOrderService {
  constructor(private readonly repo: IOrderRepository) {}

  async getAll(page: number, limit: number): Promise<PaginatedResponse<OrderAdminDTO>> {
    const { rows, count } = await this.repo.findAll(page, limit);
    return {
      data: rows.map((o) => toOrderAdminDTO(o)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getById(id: string): Promise<OrderAdminDTO> {
    const order = await this.repo.findById(id);
    if (!order) throw { status: 404, error: 'ORDER_NOT_FOUND' };
    return toOrderAdminDTO(order);
  }

  async updateStatus(id: string, status: string): Promise<OrderAdminDTO> {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw { status: 400, error: 'INVALID_STATUS' };
    }
    const order = await this.repo.updateStatus(id, status);
    return toOrderAdminDTO(order as unknown as OrderWithItems);
  }
}
