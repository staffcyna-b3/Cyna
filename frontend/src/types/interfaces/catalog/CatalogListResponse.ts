import { CatalogResponse } from "./CatalogResponse";

export interface CatalogListResponse {
  rows: CatalogResponse[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}