import { SaleRow } from '../interfaces/SaleRow.interface';

export interface DateFilter {
  from: Date;
  to: Date;
}

export interface ISalesRepository {
  findAllOrders(filter?: DateFilter): Promise<SaleRow[]>;
  findAllSubscriptions(filter?: DateFilter): Promise<SaleRow[]>;
}
