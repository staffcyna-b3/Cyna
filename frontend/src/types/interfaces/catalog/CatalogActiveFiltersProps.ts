import { TFunction } from 'i18next';
import { CatalogSortBy } from '@/types/enums/catalog/CatalogSortBy';

export interface CatalogActiveFiltersProps {
    minPrice: number | undefined;
    maxPrice: number | undefined;
    search: string | undefined;
    isService: boolean | undefined;
    inStock: boolean | undefined;
    sortBy: CatalogSortBy | undefined;
    currentSortLabel: string;
    onResetFilters: () => void;
    t: TFunction;
}
