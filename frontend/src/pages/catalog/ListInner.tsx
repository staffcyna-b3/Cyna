import { useEffect, useContext, useState } from 'react';
import { CatalogSortBy } from '../../types/enums/catalog/CatalogSortBy';
import { SortOrder } from '../../types/enums/SortOrder';
import useCatalogFetch from '../../hooks/useCatalogFetch';
import CatalogProductCard from '../../components/CatalogProductCard';
import { CatalogContext } from '../../contexts/CatalogContext';
import Pagination from '../../components/ui/Pagination';
import { Button } from '../../components/ui/button';
import FilterPanel from '../../components/FilterPanel';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useTranslation } from 'react-i18next';

export default function CatalogListInner() {
    const { data, loading, error, fetchCatalog } = useCatalogFetch();
    const ctx = useContext(CatalogContext)!;
    const { t } = useTranslation();

    // initial fetch
    useEffect(() => {
        void fetchCatalog();
    }, [fetchCatalog]);

    useEffect(() => {
        void fetchCatalog();
    }, [fetchCatalog, ctx.page, ctx.limit]);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [initialDataMin, setInitialDataMin] = useState<number | undefined>(
        undefined
    );
    const [initialDataMax, setInitialDataMax] = useState<number | undefined>(
        undefined
    );
    const [localMin, setLocalMin] = useState<number | undefined>(
        ctx.minPrice ?? undefined
    );
    const [localMax, setLocalMax] = useState<number | undefined>(
        ctx.maxPrice ?? undefined
    );
    const [localInStock, setLocalInStock] = useState<boolean | undefined>(
        ctx.inStock ?? undefined
    );
    const [localIsService, setLocalIsService] = useState<boolean | undefined>(
        ctx.isService ?? undefined
    );
    const [localSort, setLocalSort] = useState<string | ''>(
        ctx.sortBy ? `${ctx.sortBy}:${ctx.sortOrder ?? SortOrder.ASC}` : ''
    );
    const [localSearch, setLocalSearch] = useState<string | undefined>(
        ctx.search ?? undefined
    );

    const openFilters = () => {
        setLocalMin(
            ctx.minPrice ??
                Math.floor(
                    data
                        ? Math.min(...(data.rows ?? []).map((r) => r.price))
                        : 0
                )
        );
        setLocalMax(
            ctx.maxPrice ??
                Math.ceil(
                    data
                        ? Math.max(...(data.rows ?? []).map((r) => r.price))
                        : 1000
                )
        );
        setLocalInStock(ctx.inStock ?? undefined);
        setLocalIsService(ctx.isService ?? undefined);
        setLocalSort(
            ctx.sortBy ? `${ctx.sortBy}:${ctx.sortOrder ?? SortOrder.ASC}` : ''
        );
        setLocalSearch(ctx.search ?? undefined);
        setFiltersOpen(true);
    };

    const applyFilters = async () => {
        ctx.setMinPrice(localMin !== undefined ? localMin : dataMin);
        ctx.setMaxPrice(localMax !== undefined ? localMax : dataMax);
        ctx.setInStock(localInStock ?? undefined);
        ctx.setIsService(localIsService ?? undefined);
        ctx.setSearch(localSearch ?? undefined);

        if (!localSort) {
            ctx.setSortBy(undefined);
            ctx.setSortOrder(undefined);
        } else {
            const [by, order] = localSort.split(':');
            ctx.setSortBy(by as unknown as CatalogSortBy);
            ctx.setSortOrder(order === 'desc' ? SortOrder.DESC : SortOrder.ASC);
        }

        ctx.setPage(1);
        setFiltersOpen(false);
        await fetchCatalog();
    };

    const cancelFilters = () => {
        setFiltersOpen(false);
    };

    const resetFilters = async () => {
        ctx.resetFilters();
        setFiltersOpen(false);
        await fetchCatalog();
    };

    const prices = (data?.rows ?? []).map((r) => r.price);
    const dataMin = prices.length ? Math.min(...prices) : 0;
    const dataMax = prices.length ? Math.max(...prices) : 1000;

    useEffect(() => {
        if (
            (initialDataMin === undefined || initialDataMax === undefined) &&
            prices.length
        ) {
            // only set initial bounds once, when we have data
            setInitialDataMin((prev) => (prev === undefined ? dataMin : prev));
            setInitialDataMax((prev) => (prev === undefined ? dataMax : prev));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const sliderMin = initialDataMin ?? dataMin;
    const sliderMax = initialDataMax ?? dataMax;

    const activeFilterCount = (() => {
        let count = 0;
        // count price filter only if it actually narrows the full range
        if (
            (ctx.minPrice !== undefined && ctx.minPrice > sliderMin) ||
            (ctx.maxPrice !== undefined && ctx.maxPrice < sliderMax)
        )
            count++;
        if (ctx.inStock !== undefined) count++;
        if (ctx.isService !== undefined) count++;
        if (ctx.sortBy !== undefined) count++;
        if (ctx.search && ctx.search.trim().length > 0) count++;
        return count;
    })();

    const hasActiveFilters = activeFilterCount > 0;

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
        <div className="bg-gradient-to-b p-2 md:p-4 md:min-h-screen">
            {/* Top Bar */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={openFilters}
                        className="flex items-center gap-2 hover:bg-[#2a2a3d]"
                    >
                        <span className="text-lg">☰ {t('filters')}</span>
                        {hasActiveFilters && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-[#7b61ff] text-white font-semibold">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="text-[#9aa0c7] hover:text-[#b7bdd9] hover:bg-[#2a2a3d] text-xs sm:text-sm"
                        >
                            {t('resetFilters')}
                        </Button>
                    )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                        {(ctx.minPrice !== undefined ||
                            ctx.maxPrice !== undefined) && (
                            <div className="px-3 py-1.5 rounded-full bg-[#2a2a3d] text-[#b7bdd9]">
                                {ctx.minPrice ?? t('min')} —{' '}
                                {ctx.maxPrice ?? t('max')}
                            </div>
                        )}

                        {ctx.search && ctx.search.trim().length > 0 && (
                            <div className="px-3 py-1.5 rounded-full bg-[#2a2a3d] text-[#b7bdd9]">
                                {t('searchQuery', { query: ctx.search })}
                            </div>
                        )}

                        {ctx.isService !== undefined && (
                            <div className="px-3 py-1.5 rounded-full bg-[#2a2a3d] text-[#b7bdd9]">
                                {ctx.isService
                                    ? `${t('services')}`
                                    : `${t('products')}`}
                            </div>
                        )}

                        {ctx.inStock && (
                            <div className="px-3 py-1.5 rounded-full bg-[#2a2a3d] text-[#b7bdd9]">
                                {t('inStock')}
                            </div>
                        )}

                        {ctx.sortBy && (
                            <div className="px-3 py-1.5 rounded-full bg-[#2a2a3d] text-[#b7bdd9]">
                                {ctx.sortBy}{' '}
                                {ctx.sortOrder === SortOrder.DESC ? '↓' : '↑'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <FilterPanel
                open={filtersOpen}
                onClose={cancelFilters}
                onApply={applyFilters}
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

            {/* Loading & Error States */}
            {loading && <LoadingSkeleton count={8} />}
            {error && (
                <div className="flex items-center justify-center py-12 px-4">
                    <div className="max-w-xl w-full bg-[#0b0b12] border border-red-700 rounded-lg p-6 text-center">
                        <div className="text-red-400 text-lg font-semibold mb-2">
                            {t('errorOccurred')}
                        </div>
                        <div className="text-sm text-red-200 mb-4 wrap-break-words">
                            {String(error)}
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Button
                                onClick={async () => {
                                    await fetchCatalog();
                                }}
                            >
                                {t('retry')}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={async () => {
                                    ctx.resetFilters();
                                    await fetchCatalog();
                                }}
                            >
                                {t('resetFilters')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && data && (
                <>
                    {(data.rows ?? []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-24">
                            <div className="text-2xl text-[#b7bdd9] mb-2">
                                {t('noProducts')}
                            </div>
                            <div className="text-sm text-[#9aa0c7] mb-6">
                                {t('tryAdjustFilters')}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={async () => {
                                        await resetFilters();
                                    }}
                                >
                                    {t('resetFilters')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={async () => {
                                        ctx.setPage(1);
                                        await fetchCatalog();
                                    }}
                                >
                                    {t('retry')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {(data.rows ?? []).map((p) => (
                                    <CatalogProductCard
                                        key={p.id}
                                        product={p}
                                    />
                                ))}
                            </div>

                            <div className="mt-8">
                                <Pagination
                                    page={data.page}
                                    totalPages={data.totalPages}
                                    onPageChange={(p) => {
                                        ctx.setPage(p);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
