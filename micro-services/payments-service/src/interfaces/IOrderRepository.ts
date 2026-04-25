import { OrderStatus } from '../enum/OrderStatus.enum';
import { PaymentType } from '../enum/PaymentType.enum';

export interface OrderCreationData {
  user_id: string;
  total_amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  payment_type: PaymentType;
  status: OrderStatus;
}

export interface IOrderRepository {
  create(data: OrderCreationData): Promise<void>;
  findByPaymentIntentId(paymentIntentId: string): Promise<{ status: OrderStatus } | null>;
  updateStatusByPaymentIntentId(paymentIntentId: string, status: OrderStatus): Promise<void>;
}
