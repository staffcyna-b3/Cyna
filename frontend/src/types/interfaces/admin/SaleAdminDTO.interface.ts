export interface SaleAdminDTO {
  id: string;
  date: string;
  userEmail: string | null;
  productName: string;
  categoryName: string | null;
  type: 'order' | 'subscription';
  amount: number;
  status: string;
}
