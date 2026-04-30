import { ProductResponseDto } from "./ProductResponse.dto";

export interface ProductListResponseDto {
  rows: ProductResponseDto[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}