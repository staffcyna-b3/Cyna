import React, { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import byteaToImage from '../../utils/byteaToImage';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import AddToCartButton from '../../components/ui/AddToCartButton';
import { useTranslation } from 'react-i18next';
import GetOneProduct from '../../hooks/getOneProduct';
import { ProductPictureResponse } from '@/types/interfaces/catalog/ProductPictureResponse';
import placeholder from '@/assets/pictures/placeholder.svg';
import { formatCurrency } from '@/utils/currencyFormatter';
import CanBeAddToCart from '@/hooks/canBeAddToCart';
import SimilarProductsCarousel from '@/components/SimilarProductsCarousel';
import CatalogLayout from '@/layouts/CatalogLayout';
import ProductTypeBadge from '@/components/ui/ProductTypeBadge';
import ServiceDetailLayout from '@/components/ServiceDetailLayout';

export default function CatalogDetail(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: product, loading, error, getOne } = GetOneProduct();

    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        if (!id) return;
        void getOne(id);
    }, [id, getOne]);

    const images: ProductPictureResponse[] = (product?.images ?? []) as ProductPictureResponse[];
    const orderedImages: ProductPictureResponse[] = [...images].sort((a, b) => {
        if (a.isMain === b.isMain) return 0;
        return a.isMain ? -1 : 1;
    });

    const getSrc = (img?: ProductPictureResponse | null): string => {
        if (!img) return placeholder;

        if (img.base64) {
            const s: string = img.base64.trim();
            let mime: string = 'image/jpeg';
            if (s.startsWith('iVBOR')) mime = 'image/png';
            else if (s.startsWith('Qk')) mime = 'image/bmp';
            return byteaToImage(s.replace(/\s+/g, ''), mime);
        }

        if (img.id) return `/api/media/${img.id}`;
        return placeholder;
    };

    if (loading)
        return (
            <CatalogLayout>
                <div className="p-6 md:min-h-screen">
                    <LoadingSkeleton count={3} />
                </div>
            </CatalogLayout>
        );

    if (error)
        return (
            <CatalogLayout>
                <div className="p-6 md:min-h-screen flex items-center justify-center">
                    <div className="max-w-lg w-full border border-red-700 rounded-xl p-8 text-center">
                        <div className="text-red-400 text-lg font-semibold mb-2">
                            {t('errorOccurred')}
                        </div>
                        <div className="text-sm text-red-200 mb-6 wrap-break-words">
                            {error}
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                className="btn"
                                onClick={() => void getOne(id ?? '')}
                            >
                                {t('retry')}
                            </button>
                            <button
                                className="btn"
                                onClick={() => navigate(-1)}
                            >
                                {t('back')}
                            </button>
                        </div>
                    </div>
                </div>
            </CatalogLayout>
        );

    if (!product)
        return (
            <CatalogLayout>
                <div className="p-6 md:min-h-screen flex items-center justify-center">
                    <div className="text-center text-[#9aa0c7]">
                        {t('noProducts')}
                    </div>
                </div>
            </CatalogLayout>
        );

    const hasMultiple: boolean = orderedImages.length > 1;
    const isAvailable: boolean = CanBeAddToCart(product);
    const unavailableLabel = product.isService ? t('maintenance') : t('unavailable');

    // Extract abbreviation from product name (e.g., "SOC (Security Operations Center)" -> "SOC")
    const getAbbreviation = (name: string): string => {
        const match = name.match(/([A-Z]+)\s*\(/);
        return match ? match[1] : name.substring(0, 3).toUpperCase();
    };

    const abbreviation = product.isService ? getAbbreviation(product.name) : '';

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
                        <ServiceDetailLayout
                            title={product.name}
                            description={product.description || ''}
                            abbreviation={abbreviation}
                            badge={<ProductTypeBadge isService={true} />}
                        >
                            <div className="space-y-3 pt-4">
                                <div className="text-xs text-[#9aa0c7] uppercase tracking-widest font-semibold">
                                    {t('pricing')}
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-white to-[#7b61ff] bg-clip-text">
                                        {formatCurrency(product.price)}
                                    </span>
                                </div>
                            </div>

                            {product.duration && (
                                <div className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#7b61ff]/10 to-[#2b6ef6]/10 border border-[#7b61ff]/40 rounded-lg hover:border-[#7b61ff]/60 transition-colors">
                                    <div className="w-2 h-2 bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] rounded-full animate-pulse" />
                                    <span className="text-sm text-[#b7bdd9] font-medium">
                                        {product.duration} {t('days')}
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4">
                                <div className="rounded-xl p-5 border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 transition-colors">
                                    <div className="text-xs mb-2 uppercase tracking-wide text-[#9aa0c7]">
                                        {t('total')}
                                    </div>
                                    <div className="text-4xl font-black text-transparent bg-gradient-to-r from-white to-[#7b61ff] bg-clip-text">
                                        {formatCurrency(product.price)}
                                    </div>
                                </div>

                                <AddToCartButton
                                    disabled={!isAvailable}
                                    productId={product.id}
                                    text={
                                        isAvailable
                                            ? t('addToCart')
                                            : unavailableLabel
                                    }
                                />
                            </div>
                        </ServiceDetailLayout>
                    ) : (
                        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-10 items-center py-8 md:py-12">
                            {/* Product Layout: Left - Details */}
                            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center gap-6">
                                <div className="space-y-4">
                                    <div className="inline-block">
                                        <ProductTypeBadge isService={false} />
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                                        <span className="text-transparent bg-gradient-to-r from-white via-[#e0e7ff] to-[#c7d2fe] bg-clip-text">
                                            {product.name}
                                        </span>
                                    </h1>
                                    <p className="text-base text-[#b7bdd9] leading-relaxed line-clamp-4">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs text-[#9aa0c7] uppercase tracking-widest font-semibold">
                                        {t('pricing')}
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-black text-transparent bg-gradient-to-r from-white to-[#7b61ff] bg-clip-text">
                                            {formatCurrency(product.price)}
                                        </span>
                                    </div>
                                </div>

                                {product.stock > 0 && product.stock < 10 && (
                                    <div className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/40 rounded-lg hover:border-yellow-500/60 transition-colors">
                                        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                                        <span className="text-sm text-yellow-300 font-medium">
                                            {t('onlyNLeft', {
                                                count: product.stock,
                                            })}
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 pt-4">
                                    <div className="rounded-xl p-5 border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 transition-colors">
                                        <div className="text-xs mb-2 uppercase tracking-wide text-[#9aa0c7]">
                                            {t('total')}
                                        </div>
                                        <div className="text-4xl font-black text-transparent bg-gradient-to-r from-white to-[#7b61ff] bg-clip-text">
                                            {formatCurrency(product.price)}
                                        </div>
                                    </div>

                                    <AddToCartButton
                                        disabled={!isAvailable}
                                        productId={product.id}
                                        text={
                                            isAvailable
                                                ? t('addToCart')
                                                : unavailableLabel
                                        }
                                    />
                                </div>
                            </div>

                            {/* Product Layout: Right - Images */}
                            <div className="col-span-12 lg:col-span-6 flex items-center justify-center py-8 lg:py-0">
                                {hasMultiple ? (
                                    <div className="w-full">
                                        <div className="relative group overflow-hidden rounded-2xl">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#7b61ff]/20 to-[#2b6ef6]/20 group-hover:from-[#7b61ff]/30 group-hover:to-[#2b6ef6]/30 transition-all duration-300 z-10 pointer-events-none" />
                                            <img
                                                src={getSrc(orderedImages[currentIndex])}
                                                alt={product.name}
                                                className="w-full aspect-square object-cover rounded-2xl shadow-2xl shadow-[#7b61ff]/20 group-hover:shadow-[#7b61ff]/40 group-hover:scale-105 transition-all duration-300"
                                            />
                                            <button
                                                    aria-label={t('previous')}
                                                onClick={() =>
                                                    setCurrentIndex(
                                                        (currentIndex - 1 + orderedImages.length) %
                                                            orderedImages.length
                                                    )
                                                }
                                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] hover:shadow-lg hover:shadow-[#7b61ff]/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                            >
                                                <svg
                                                    className="w-4 h-4"
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
                                            </button>
                                            <button
                                                    aria-label={t('next')}
                                                onClick={() =>
                                                    setCurrentIndex(
                                                        (currentIndex + 1) %
                                                            orderedImages.length
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] hover:shadow-lg hover:shadow-[#7b61ff]/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                            {orderedImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() =>
                                                        setCurrentIndex(idx)
                                                    }
                                                    className={`flex-shrink-0 rounded-lg transition-all duration-300 ${
                                                        idx === currentIndex
                                                            ? 'ring-2 ring-[#7b61ff] scale-100 shadow-lg shadow-[#7b61ff]/40'
                                                            : 'opacity-60 hover:opacity-90'
                                                    }`}
                                                >
                                                    <img
                                                        src={getSrc(img)}
                                                        alt={`${product.name}-${idx}`}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group overflow-hidden rounded-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#7b61ff]/20 to-[#2b6ef6]/20 group-hover:from-[#7b61ff]/30 group-hover:to-[#2b6ef6]/30 transition-all duration-300 z-10 pointer-events-none" />
                                        <img
                                            src={getSrc(orderedImages[0])}
                                            alt={product.name}
                                            className="w-full aspect-square object-cover rounded-2xl shadow-2xl shadow-[#7b61ff]/20 group-hover:shadow-[#7b61ff]/40 group-hover:scale-105 transition-all duration-300"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black mb-3 text-transparent bg-gradient-to-r from-white to-[#9aa0c7] bg-clip-text">
                            {t('similarProducts')}
                        </h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] rounded-full" />
                    </div>
                    <SimilarProductsCarousel productId={product.id} />
                </div>
            </div>
        </div>
    );
}
