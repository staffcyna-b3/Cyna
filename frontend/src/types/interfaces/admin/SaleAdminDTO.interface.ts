export interface SaleAdminDTO {
  id: string;
  date: string;
  userEmail: string | null;
  productName: string;
  type: 'order' | 'subscription';
  amount: number;
  status: string;
}
