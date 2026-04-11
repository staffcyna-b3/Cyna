import { Sort } from "../../types/Sort";

export interface ProductListFilterDto {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isService?: boolean;
  inStock?: boolean;
  sortBy?: Sort['sortBy'];
  sortOrder?: Sort['sortOrder'];
}