import { JSX, useEffect, useMemo } from 'react';
import GetSimilarProducts from '@/hooks/getSimilarProducts';
import CatalogProductCard from './CatalogProductCard';
import LoadingSkeleton from './ui/LoadingSkeleton';
import { useTranslation } from 'react-i18next';

export default function SimilarProductsCarousel({
    productId,
}: {
    productId: string;
}): JSX.Element | null {
    const { t } = useTranslation();
    const { data, loading, error, getSimilarProducts } = GetSimilarProducts();

    useEffect(() => {
        if (!productId) return;
        void getSimilarProducts(productId);
    }, [productId, getSimilarProducts]);

    const safeData = useMemo(() => data ?? [], [data]);

    if (loading) return <LoadingSkeleton count={4} />;
    if (error) return null;
    if (safeData.length === 0) return null;

    return (
        <div className="w-full mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-[#9aa0c7]">
                        {t('nProductsAvailable', { count: safeData.length })}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto pb-2 -mx-2 scrollbar-hide">
                <div className="flex gap-4 px-2 snap-x snap-mandatory">
                    {safeData.map((product) => (
                        <div key={product.id} className="snap-start">
                            <CatalogProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
