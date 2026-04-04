import { useEffect, useContext, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpWideNarrow } from 'lucide-react';
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

export default function CatalogList() {
    const { data, loading, error, fetchCatalog } = useCatalogFetch();
    const ctx = useContext(CatalogContext)!;
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [initialDataMin, setInitialDataMin] = useState<number | undefined>(undefined);
    const [initialDataMax, setInitialDataMax] = useState<number | undefined>(undefined);
    const [localMin, setLocalMin] = useState<number | undefined>(ctx.minPrice ?? undefined);
    const [localMax, setLocalMax] = useState<number | undefined>(ctx.maxPrice ?? undefined);
    const [localInStock, setLocalInStock] = useState<boolean | undefined>(ctx.inStock ?? undefined);
    const [localIsService, setLocalIsService] = useState<boolean | undefined>(ctx.isService ?? undefined);
    const [localSort, setLocalSort] = useState<string | ''>(ctx.sortBy ? `${ctx.sortBy}:${ctx.sortOrder ?? SortOrder.ASC}` : '');
    const [localSearch, setLocalSearch] = useState<string | undefined>(ctx.search ?? undefined);

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

    const prices = (data?.rows ?? []).map((r) => r.price);
    const dataMin = prices.length ? Math.min(...prices) : 0;
    const dataMax = prices.length ? Math.max(...prices) : 1000;

    const syncLocalStateFromContext = () => {
        setLocalMin(ctx.minPrice ?? Math.floor(dataMin));
        setLocalMax(ctx.maxPrice ?? Math.ceil(dataMax));
        setLocalInStock(ctx.inStock ?? undefined);
        setLocalIsService(ctx.isService ?? undefined);
        setLocalSort(ctx.sortBy ? `${ctx.sortBy}:${ctx.sortOrder ?? SortOrder.ASC}` : '');
        setLocalSearch(ctx.search ?? undefined);
    };

    const openFilters = () => {
        syncLocalStateFromContext();
        setFiltersOpen(true);
    };

    const openSort = () => {
        syncLocalStateFromContext();
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
    };

    const cancelFilters = () => {
        setFiltersOpen(false);
    };

    const resetFilters = async () => {
        ctx.resetFilters();
        if (categoryIdFromQuery !== undefined) {
            ctx.setCategoryId(categoryIdFromQuery);
        }
        setFiltersOpen(false);
    };

    useEffect(() => {
        if ((initialDataMin === undefined || initialDataMax === undefined) && prices.length) {
            setInitialDataMin((prev) => (prev === undefined ? dataMin : prev));
            setInitialDataMax((prev) => (prev === undefined ? dataMax : prev));
        }
    }, [data, dataMax, dataMin, initialDataMax, initialDataMin, prices.length]);

    const sliderMin = initialDataMin ?? dataMin;
    const sliderMax = initialDataMax ?? dataMax;

    const activeFilterCount = (() => {
        let count = 0;
        if ((ctx.minPrice !== undefined && ctx.minPrice > sliderMin) || (ctx.maxPrice !== undefined && ctx.maxPrice < sliderMax)) count++;
        if (ctx.inStock !== undefined) count++;
        if (ctx.isService !== undefined) count++;
        if (ctx.sortBy !== undefined) count++;
        if (ctx.search && ctx.search.trim().length > 0) count++;
        return count;
    })();

    const hasActiveFilters = activeFilterCount > 0;
    const currentSortLabel = (() => {
        if (!ctx.sortBy) {
            return t('sortBy');
        }

        if (ctx.sortBy === CatalogSortBy.PRICE && ctx.sortOrder === SortOrder.DESC) {
            return t('priceDesc');
        }

        if (ctx.sortBy === CatalogSortBy.PRICE) {
            return t('priceAsc');
        }

        if (ctx.sortBy === CatalogSortBy.PRIORITY) {
            return t('priority');
        }

        return t('sortBy');
    })();

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
                <div className="mb-6 flex">
                    <div className="inline-flex w-full max-w-max items-center rounded-[24px] border border-white/10 bg-[rgba(52,52,72,0.92)] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-md">
                        <button
                            type="button"
                            onClick={openFilters}
                            className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-[18px] bg-[#4a44df] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5a55eb] sm:text-base"
                        >
                            <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>{t('filters')}</span>
                            {hasActiveFilters && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/18 px-1 text-[11px] font-bold text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={openSort}
                            className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/8 sm:text-base"
                        >
                            <ArrowUpWideNarrow className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>{currentSortLabel}</span>
                        </button>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {(ctx.minPrice !== undefined || ctx.maxPrice !== undefined) && (
                            <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                                {ctx.minPrice ?? t('min')} - {ctx.maxPrice ?? t('max')}
                            </div>
                        )}

                        {ctx.search && ctx.search.trim().length > 0 && (
                            <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                                {t('searchQuery', { query: ctx.search })}
                            </div>
                        )}

                        {ctx.isService !== undefined && (
                            <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                                {ctx.isService ? t('services') : t('products')}
                            </div>
                        )}

                        {ctx.inStock && (
                            <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                                {t('inStock')}
                            </div>
                        )}

                        {ctx.sortBy && (
                            <div className="rounded-full bg-[#2a2a3d] px-3 py-1.5 text-[#b7bdd9]">
                                {currentSortLabel}
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-auto rounded-full border border-white/10 px-3 py-1.5 text-[#b7bdd9] hover:bg-[#2a2a3d] hover:text-white"
                        >
                            {t('resetFilters')}
                        </Button>
                    </div>
                )}

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

                {loading && <LoadingSkeleton count={8} />}
                {error && (
                    <div className="flex items-center justify-center px-4 py-12">
                        <div className="w-full max-w-xl rounded-lg border border-red-700 bg-[#0b0b12] p-6 text-center">
                            <div className="mb-2 text-lg font-semibold text-red-400">
                                {t('errorOccurred')}
                            </div>
                            <div className="mb-4 text-sm text-red-200 wrap-break-words">
                                {String(error)}
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <Button onClick={async () => { await fetchCatalog(); }}>
                                    {t('retry')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={async () => {
                                        await resetFilters();
                                    }}
                                >
                                    {t('resetFilters')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && data && (
                    <>
                        {(data.rows ?? []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="mb-2 text-2xl text-[#b7bdd9]">
                                    {t('noProducts')}
                                </div>
                                <div className="mb-6 text-sm text-[#9aa0c7]">
                                    {t('tryAdjustFilters')}
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={async () => { await resetFilters(); }}>
                                        {t('resetFilters')}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={async () => {
                                            ctx.setPage(1);
                                        }}
                                    >
                                        {t('retry')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                                    {(data.rows ?? []).map((p) => (
                                        <CatalogProductCard key={p.id} product={p} />
                                    ))}
                                </div>

                                <div className="mb-12 mt-8 md:mb-24">
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
        </div>
    );
}
