export interface RefundAdminDTO {
  id: string;
  amount: number;
  status: string;
  reason: string | null;
  payment_intent: string;
  created: number;
}
