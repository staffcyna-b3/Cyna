import { createContext } from "react";
import { CatalogFilters } from "../types/interfaces/catalog/CatelogFilters";
import { CatalogSortBy } from "../types/enums/catalog/CatalogSortBy";
import { Sort } from "../types/interfaces/Sort";

export interface CatalogContextProps {
	page: number;
	limit: number;
	categoryId?: string;
	minPrice?: number;
	maxPrice?: number;
	search?: string;
	isService?: boolean;
	inStock?: boolean;
	sortBy?: Sort<CatalogSortBy>["sortBy"];
	sortOrder?: Sort<CatalogSortBy>["sortOrder"];

	setPage: (p: number) => void;
	setLimit: (l: number) => void;
	setCategoryId: (id?: string) => void;
	setMinPrice: (v?: number) => void;
	setMaxPrice: (v?: number) => void;
	setSearch: (s?: string) => void;
	setIsService: (v?: boolean) => void;
	setInStock: (v?: boolean) => void;
	setSortBy: (v?: Sort<CatalogSortBy>["sortBy"]) => void;
	setSortOrder: (v?: Sort<CatalogSortBy>["sortOrder"]) => void;

	getPayload: () => Partial<CatalogFilters>;
	resetFilters: () => void;
}

export const CatalogContext = createContext<CatalogContextProps | undefined>(
	undefined
);
