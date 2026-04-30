export interface TransactionAdminDTO {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
}
