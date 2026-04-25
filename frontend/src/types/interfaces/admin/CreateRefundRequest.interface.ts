export interface CreateRefundRequest {
  payment_intent_id: string;
  amount?: number;
  reason?: string;
}
