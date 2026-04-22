import { IOrderRepository, OrderWithItems } from '../interfaces/IOrderRepository';
import { IOrderService } from '../interfaces/IOrderService';
import { PaginatedResponse } from '../dto/PaginatedResponse';
import { OrderAdminDTO } from '../dto/OrderAdminDTO';
import { OrderStatus } from '../enum/OrderStatus';

export class OrderService implements IOrderService {
  constructor(private readonly repo: IOrderRepository) {}

  async getAll(page: number, limit: number): Promise<PaginatedResponse<OrderAdminDTO>> {
    const { rows, count } = await this.repo.findAll(page, limit);
    return {
      data: rows.map((o) => this.toDTO(o)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getById(id: string): Promise<OrderAdminDTO> {
    const order = await this.repo.findById(id);
    if (!order) throw { status: 404, error: 'ORDER_NOT_FOUND' };
    return this.toDTO(order);
  }

  async updateStatus(id: string, status: string): Promise<OrderAdminDTO> {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw { status: 400, error: 'INVALID_STATUS' };
    }
    const order = await this.repo.updateStatus(id, status);
    return this.toDTO(order as unknown as OrderWithItems);
  }

  private toDTO(order: OrderWithItems): OrderAdminDTO {
    return {
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      total_amount: Number(order.total_amount),
      stripe_payment_intent_id: order.stripe_payment_intent_id ?? null,
      created_at: order.created_at.toISOString(),
      items: (order.items ?? []).map((i) => ({
        product_name: i.product?.name ?? i.product_id,
        quantity: i.quantity,
        unit_price: Number(i.unit_price),
      })),
    };
  }
}
