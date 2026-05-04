export interface SaleRow {
  id: string;
  date: Date;
  userEmail: string | null;
  productNames: Array<string | null>;
  categoryNames: string[];
  type: 'order' | 'subscription';
  amount: number;
  status: string;
}