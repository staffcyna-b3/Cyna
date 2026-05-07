import { JSX, useEffect, useMemo } from 'react';
import useSimilarProducts from '@/hooks/useSimilarProducts';
import CatalogProductCard from './CatalogProductCard';
import LoadingSkeleton from '../LoadingSkeleton';
import { useTranslation } from 'react-i18next';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';

export default function SimilarProductsCarousel({
    productId,
}: {
    productId: string;
}): JSX.Element | null {
    const { t } = useTranslation();
    const { data, loading, error, getSimilarProducts } = useSimilarProducts();

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
            <p className="text-sm text-[#9aa0c7] mb-6">
                {t('nProductsAvailable', { count: safeData.length })}
            </p>

            <Carousel opts={{ align: 'start', dragFree: true }} className="w-full px-4 sm:px-10">
                <CarouselContent>
                    {safeData.map((product) => (
                        <CarouselItem key={product.id} className="basis-auto">
                            <CatalogProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}
