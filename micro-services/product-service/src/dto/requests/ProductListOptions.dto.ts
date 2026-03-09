import { ProductListFilterDto } from "./ProductListFilter.dto";

export interface ProductListOptionsDto {
  page?: number;
  limit?: number;
  filters?: ProductListFilterDto;
}