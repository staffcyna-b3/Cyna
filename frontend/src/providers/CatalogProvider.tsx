import { useState, useCallback, type ReactNode } from "react";
import { CatalogContext } from "../contexts/CatalogContext";
import { CatalogSortBy } from "../types/enums/catalog/CatalogSortBy";
import { Sort } from "../types/interfaces/Sort";
import { CatalogFilters } from "../types/interfaces/catalog/CatalogFilters";

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
	const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
	const [search, setSearch] = useState<string | undefined>(undefined);
	const [isService, setIsService] = useState<boolean | undefined>(undefined);
	const [inStock, setInStock] = useState<boolean | undefined>(undefined);
	const [sortBy, setSortBy] = useState<Sort<CatalogSortBy>["sortBy"] | undefined>(undefined);
	const [sortOrder, setSortOrder] = useState<Sort<CatalogSortBy>["sortOrder"] | undefined>(undefined);

	const resetFilters = useCallback(() => {
		setPage(1);
		setLimit(10);
		setCategoryId(undefined);
		setMinPrice(undefined);
		setMaxPrice(undefined);
		setSearch(undefined);
		setIsService(undefined);
		setInStock(undefined);
		setSortBy(undefined);
		setSortOrder(undefined);
	}, []);

	const getPayload = useCallback(() => {
		const payload: Partial<CatalogFilters> = {};
		if (categoryId) payload.categoryId = categoryId;
		if (minPrice !== undefined) payload.minPrice = minPrice;
		if (maxPrice !== undefined) payload.maxPrice = maxPrice;
		if (search) payload.search = search;
		if (isService !== undefined) payload.isService = isService;
		if (inStock !== undefined) payload.inStock = inStock;
		if (sortBy !== undefined) payload.sortBy = sortBy;
		if (sortOrder !== undefined) payload.sortOrder = sortOrder;
		return payload;
	}, [categoryId, minPrice, maxPrice, search, isService, inStock, sortBy, sortOrder]);

	return (
		<CatalogContext.Provider
			value={{
				page,
				limit,
				categoryId,
				minPrice,
				maxPrice,
				search,
				isService,
				inStock,
				sortBy,
				sortOrder,

				setPage,
				setLimit,
				setCategoryId,
				setMinPrice,
				setMaxPrice,
				setSearch,
				setIsService,
				setInStock,
				setSortBy,
				setSortOrder,

				getPayload,
				resetFilters,
			}}
		>
			{children}
		</CatalogContext.Provider>
	);
};

export default CatalogProvider;
