export interface OrderAdminDTO {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}
