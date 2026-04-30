import { TFunction } from 'i18next';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import CatalogProductCard from '@/components/Frontoffice/CatalogProductCard';
import Pagination from '@/components/Frontoffice/Pagination';
import { CatalogListResponse } from '@/types/interfaces/catalog/CatalogListResponse';

interface CatalogResultsProps {
    loading: boolean;
    error: string | null;
    data: CatalogListResponse | null;
    t: TFunction;
    onRetryFetch: () => void;
    onResetFilters: () => void;
    onRetryPagination: () => void;
    onPageChange: (page: number) => void;
}

export default function CatalogResults({
    loading,
    error,
    data,
    t,
    onRetryFetch,
    onResetFilters,
    onRetryPagination,
    onPageChange,
}: CatalogResultsProps) {
    if (loading) {
        return <LoadingSkeleton count={8} />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl rounded-lg border border-red-700 bg-[#0b0b12] p-6 text-center">
                    <div className="mb-2 text-lg font-semibold text-red-400">
                        {t('errorOccurred')}
                    </div>
                    <div className="mb-4 text-sm text-red-200 wrap-break-words">
                        {String(error)}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Button onClick={onRetryFetch}>{t('retry')}</Button>
                        <Button variant="ghost" onClick={onResetFilters}>
                            {t('resetFilters')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    if ((data.rows ?? []).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-2 text-2xl text-[#b7bdd9]">{t('noProducts')}</div>
                <div className="mb-6 text-sm text-[#9aa0c7]">{t('tryAdjustFilters')}</div>
                <div className="flex gap-3">
                    <Button onClick={onResetFilters}>{t('resetFilters')}</Button>
                    <Button variant="ghost" onClick={onRetryPagination}>
                        {t('retry')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {(data.rows ?? []).map((product) => (
                    <CatalogProductCard key={product.id} product={product} />
                ))}
            </div>

            <div className="mb-12 mt-8 md:mb-24">
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </>
    );
}
