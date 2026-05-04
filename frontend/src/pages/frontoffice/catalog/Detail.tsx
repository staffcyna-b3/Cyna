import { JSX, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useProductDetail from '@/hooks/useProductDetail';
import CanBeAddToCart from '@/hooks/canBeAddToCart';
import SimilarProductsCarousel from '@/components/Frontoffice/SimilarProductsCarousel';
import {
    DetailEmptyState,
    DetailErrorState,
    DetailLoadingState,
} from '@/components/Frontoffice/catalog/DetailFeedbackStates';
import {
    PhysicalProductDetailSection,
    ServiceDetailSection,
} from '@/components/Frontoffice/catalog/DetailSections';

export default function CatalogDetail(): JSX.Element {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: product, loading, error, getOne } = useProductDetail();

    useEffect(() => {
        if (!slug) return;
        void getOne(slug);
    }, [slug, getOne]);

    if (loading) {
        return <DetailLoadingState />;
    }

    if (error) {
        return (
            <DetailErrorState
                error={error}
                onRetry={() => void getOne(slug ?? '')}
                onBack={() => navigate(-1)}
                t={t}
            />
        );
    }

    if (!product) {
        return <DetailEmptyState t={t} />;
    }

    const isAvailable: boolean = CanBeAddToCart(product);
    const unavailableLabel = product.isService ? t('maintenance') : t('unavailable');

    return (
        <div className="w-full">
            <div className="relative overflow-hidden">
                <div className="relative p-4 md:p-8 lg:p-12">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-8 flex items-center gap-2 text-[#9aa0c7] hover:text-[#7b61ff] transition-all duration-300 group"
                        aria-label={t('back')}
                    >
                        <svg
                            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        <span className="text-sm">{t('back')}</span>
                    </button>

                    {product.isService ? (
                        <ServiceDetailSection
                            product={product}
                            t={t}
                            isAvailable={isAvailable}
                            unavailableLabel={unavailableLabel}
                        />
                    ) : (
                        <PhysicalProductDetailSection
                            product={product}
                            t={t}
                            isAvailable={isAvailable}
                            unavailableLabel={unavailableLabel}
                        />
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black mb-3 text-transparent bg-linear-to-r from-white to-[#9aa0c7] bg-clip-text">
                            {t('similarProducts')}
                        </h2>
                        <div className="w-12 h-1 bg-linear-to-r from-[#7b61ff] to-[#2b6ef6] rounded-full" />
                    </div>
                    <SimilarProductsCarousel productId={product.id} />
                </div>
            </div>
        </div>
    );
}
