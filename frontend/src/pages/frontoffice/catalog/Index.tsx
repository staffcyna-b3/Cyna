import { useEffect, useContext, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogSortBy } from '@/types/enums/catalog/CatalogSortBy';
import { SortOrder } from '@/types/enums/SortOrder';
import useCatalogFetch from '@/hooks/useCatalogFetch';
import { CatalogContext } from '@/contexts/CatalogContext';
import FilterPanel from '@/components/Frontoffice/FilterPanel';
import { useTranslation } from 'react-i18next';
import CatalogHero from '@/components/Frontoffice/catlog/CatalogHero';
import CatalogActionsBar from '@/components/Frontoffice/catlog/CatalogActionsBar';
import CatalogActiveFilters from '@/components/Frontoffice/catlog/CatalogActiveFilters';
import CatalogResults from '@/components/Frontoffice/catlog/CatalogResults';
import {
    buildSortValue,
    getActiveFilterCount,
    getCatalogHeaderContent,
    getCurrentSortLabel,
    getPriceBounds,
    parseSortValue,
} from '@/helpers/frontoffice/catalog/indexHelpers';

export default function CatalogList() {
    const { data, loading, error, fetchCatalog } = useCatalogFetch();
    const ctx = useContext(CatalogContext)!;
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<'filters' | 'sort'>('filters');
    const [initialDataMin, setInitialDataMin] = useState<number | undefined>(undefined);
    const [initialDataMax, setInitialDataMax] = useState<number | undefined>(undefined);
    const [localMin, setLocalMin] = useState<number | undefined>(ctx.minPrice ?? undefined);
    const [localMax, setLocalMax] = useState<number | undefined>(ctx.maxPrice ?? undefined);
    const [localInStock, setLocalInStock] = useState<boolean | undefined>(ctx.inStock ?? undefined);
    const [localIsService, setLocalIsService] = useState<boolean | undefined>(ctx.isService ?? undefined);
    const [localSort, setLocalSort] = useState<string | ''>(
        buildSortValue(
            ctx.sortBy as CatalogSortBy | undefined,
            ctx.sortOrder as SortOrder | undefined
        )
    );
    const [localSearch, setLocalSearch] = useState<string | undefined>(ctx.search ?? undefined);
    const catalogStartRef = useRef<HTMLDivElement | null>(null);

    const {
        name: categoryName,
        description: categoryDescription,
        abbreviation: categoryAbbreviation,
    } = getCatalogHeaderContent(data, t);

    function scrollToCatalogControls(): void {
        if (!catalogStartRef.current) return;
        const targetTop =
            catalogStartRef.current.getBoundingClientRect().top +
            window.scrollY -
            72;
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth',
        });
    }

    const categoryIdFromQuery = useMemo(
        () => searchParams.get('categoryId') ?? searchParams.get('category') ?? undefined,
        [searchParams]
    );

    const isCategorySynced = ctx.categoryId === categoryIdFromQuery;

    useEffect(() => {
        if (!isCategorySynced) {
            ctx.setCategoryId(categoryIdFromQuery);
            ctx.setPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCategorySynced, categoryIdFromQuery]);

    useEffect(() => {
        if (!isCategorySynced) {
            return;
        }
        void fetchCatalog();
    }, [fetchCatalog, isCategorySynced]);

    const { dataMin, dataMax } = getPriceBounds(data);
    const hasPriceData = (data?.rows?.length ?? 0) > 0;

    function syncLocalStateFromContext(): void {
        setLocalMin(ctx.minPrice ?? Math.floor(dataMin));
        setLocalMax(ctx.maxPrice ?? Math.ceil(dataMax));
        setLocalInStock(ctx.inStock ?? undefined);
        setLocalIsService(ctx.isService ?? undefined);
        setLocalSort(
            buildSortValue(
                ctx.sortBy as CatalogSortBy | undefined,
                ctx.sortOrder as SortOrder | undefined
            )
        );
        setLocalSearch(ctx.search ?? undefined);
    }

    function openFilters(): void {
        syncLocalStateFromContext();
        setPanelMode('filters');
        setFiltersOpen(true);
    }

    function openSort(): void {
        syncLocalStateFromContext();
        setPanelMode('sort');
        setFiltersOpen(true);
    }

    function applyFilters(): void {
        ctx.setMinPrice(localMin !== undefined ? localMin : dataMin);
        ctx.setMaxPrice(localMax !== undefined ? localMax : dataMax);
        ctx.setInStock(localInStock ?? undefined);
        ctx.setIsService(localIsService ?? undefined);
        ctx.setSearch(localSearch ?? undefined);

        const { sortBy, sortOrder } = parseSortValue(localSort);
        ctx.setSortBy(sortBy);
        ctx.setSortOrder(sortOrder);

        ctx.setPage(1);
        setFiltersOpen(false);
    }

    function applySort(value: string | ''): void {
        const { sortBy: nextSortBy, sortOrder: nextSortOrder } = parseSortValue(value);
        ctx.setSortBy(nextSortBy);
        ctx.setSortOrder(nextSortOrder);

        ctx.setPage(1);
        void fetchCatalog({
            page: 1,
            sortBy: nextSortBy,
            sortOrder: nextSortOrder,
        });
        setFiltersOpen(false);
    }

    function cancelFilters(): void {
        setFiltersOpen(false);
    }

    function resetFilters(): void {
        ctx.resetFilters();
        if (categoryIdFromQuery !== undefined) {
            ctx.setCategoryId(categoryIdFromQuery);
        }
        setFiltersOpen(false);
    }

    useEffect(() => {
        if ((initialDataMin === undefined || initialDataMax === undefined) && hasPriceData) {
            setInitialDataMin((prev) => (prev === undefined ? dataMin : prev));
            setInitialDataMax((prev) => (prev === undefined ? dataMax : prev));
        }
    }, [data, dataMax, dataMin, hasPriceData, initialDataMax, initialDataMin]);

    const sliderMin = initialDataMin ?? dataMin;
    const sliderMax = initialDataMax ?? dataMax;

    const activeFilterCount = getActiveFilterCount(ctx, sliderMin, sliderMax);

    const hasActiveFilters = activeFilterCount > 0;
    const currentSortLabel = getCurrentSortLabel(
        ctx.sortBy as CatalogSortBy | undefined,
        ctx.sortOrder as SortOrder | undefined,
        t
    );

    useEffect(() => {
        if (filtersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [filtersOpen]);

    return (
        <div className="px-4 pb-32 pt-4 md:min-h-screen md:px-6 md:pb-20 lg:px-10 xl:px-16">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <CatalogHero
                        categoryName={categoryName}
                        categoryDescription={categoryDescription}
                        categoryAbbreviation={categoryAbbreviation}
                        discoverLabel={
                            t('discoverSolutions', {
                                abbr: categoryAbbreviation,
                            })
                        }
                        onDiscover={scrollToCatalogControls}
                    />
                </div>

                <div ref={catalogStartRef} className="mb-6 flex">
                    <CatalogActionsBar
                        filtersLabel={t('filters')}
                        currentSortLabel={currentSortLabel}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFilterCount}
                        onOpenFilters={openFilters}
                        onOpenSort={openSort}
                    />
                </div>

                {hasActiveFilters && (
                    <CatalogActiveFilters
                        minPrice={ctx.minPrice}
                        maxPrice={ctx.maxPrice}
                        search={ctx.search}
                        isService={ctx.isService}
                        inStock={ctx.inStock}
                        sortBy={ctx.sortBy as CatalogSortBy | undefined}
                        currentSortLabel={currentSortLabel}
                        onResetFilters={resetFilters}
                        t={t}
                    />
                )}

                <FilterPanel
                    open={filtersOpen}
                    mode={panelMode}
                    onClose={cancelFilters}
                    onApply={applyFilters}
                    onApplySort={applySort}
                    localSearch={localSearch}
                    setLocalSearch={setLocalSearch}
                    localMin={localMin}
                    setLocalMin={setLocalMin}
                    localMax={localMax}
                    setLocalMax={setLocalMax}
                    localInStock={localInStock}
                    setLocalInStock={setLocalInStock}
                    localIsService={localIsService}
                    setLocalIsService={setLocalIsService}
                    localSort={localSort}
                    setLocalSort={setLocalSort}
                    sliderMin={sliderMin}
                    sliderMax={sliderMax}
                />

                <CatalogResults
                    loading={loading}
                    error={error}
                    data={data}
                    t={t}
                    onRetryFetch={() => {
                        void fetchCatalog();
                    }}
                    onResetFilters={resetFilters}
                    onRetryPagination={() => {
                        ctx.setPage(1);
                    }}
                    onPageChange={(page) => {
                        ctx.setPage(page);
                    }}
                />
            </div>
        </div>
    );
}
