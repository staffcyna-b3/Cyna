import { OrderAdminDTO } from '../OrderAdminDTO';
import { OrderWithItems } from '../../interfaces/IOrderRepository';

export function toOrderAdminDTO(order: OrderWithItems): OrderAdminDTO {
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
