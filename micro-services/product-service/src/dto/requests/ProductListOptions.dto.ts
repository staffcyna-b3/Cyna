import { ProductListFilterDto } from "./ProductListFilter.dto";
import { WhereOptions } from 'sequelize';
import Product from '../../models/Product';

export interface ProductListOptionsDto {
  page?: number;
  limit?: number;
  filters?: ProductListFilterDto;
  where?: WhereOptions<Product>;
  order?: any;
}