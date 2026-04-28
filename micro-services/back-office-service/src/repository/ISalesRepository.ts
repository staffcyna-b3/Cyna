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

export interface DateFilter {
  from: Date;
  to: Date;
}

export interface ISalesRepository {
  findAllOrders(filter?: DateFilter): Promise<SaleRow[]>;
  findAllSubscriptions(filter?: DateFilter): Promise<SaleRow[]>;
}
