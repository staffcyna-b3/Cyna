// TODO: migré vers payments-service — à supprimer après validation
import { OrderStatus } from "../enum/OrderStatus.enum";
import { PaymentType } from "../enum/PaymentType.enum";

export interface PaymentAttributes {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_payment_intent_id: string;
  payment_type: PaymentType;
  created_at?: Date;
  updated_at?: Date;
}