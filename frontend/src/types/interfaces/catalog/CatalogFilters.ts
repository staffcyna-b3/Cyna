import { CatalogSortBy } from "../../enums/catalog/CatalogSortBy";
import { Sort } from "../Sort";

export interface CatalogFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isService?: boolean;
    inStock?: boolean;
    sortBy?: Sort<CatalogSortBy>["sortBy"];
    sortOrder?: Sort<CatalogSortBy>["sortOrder"];
    page: number;
    limit: number;
}
