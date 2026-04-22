export interface CatalogActionsBarProps {
    filtersLabel: string;
    currentSortLabel: string;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    onOpenFilters: () => void;
    onOpenSort: () => void;
}
