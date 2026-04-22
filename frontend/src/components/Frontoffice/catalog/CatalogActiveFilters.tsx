import { Button } from '@/components/ui/button';
import { CatalogActiveFiltersProps } from '@/types/interfaces/catalog/CatalogActiveFiltersProps';

export default function CatalogActiveFilters({
    minPrice,
    maxPrice,
    search,
    isService,
    inStock,
    sortBy,
    currentSortLabel,
    onResetFilters,
    t,
}: CatalogActiveFiltersProps) {
    return (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {(minPrice !== undefined || maxPrice !== undefined) && (
                <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                    {minPrice ?? t('min')} - {maxPrice ?? t('max')}
                </div>
            )}

            {search && search.trim().length > 0 && (
                <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                    {t('searchQuery', { query: search })}
                </div>
            )}

            {isService !== undefined && (
                <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                    {isService ? t('services') : t('products')}
                </div>
            )}

            {inStock && (
                <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                    {t('inStock')}
                </div>
            )}

            {sortBy && (
                <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                    {currentSortLabel}
                </div>
            )}

            <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-auto rounded-full border border-white/10 px-3 py-1.5 text-[#b7bdd9] hover:bg-[#2a2a3d] hover:text-white"
            >
                {t('resetFilters')}
            </Button>
        </div>
    );
}
