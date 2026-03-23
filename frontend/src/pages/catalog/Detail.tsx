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

export default function CatalogDetail(): JSX.Element {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: product, loading, error, getOne } = GetOneProduct();

    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        if (!id) return;
        void getOne(id);
    }, [id, getOne]);

    const images = (product?.images ?? []) as ProductPictureResponse[];
    const orderedImages = [...images].sort((a, b) => {
        if (a.isMain === b.isMain) return 0;
        return a.isMain ? -1 : 1;
    });

    const getSrc = (img?: ProductPictureResponse | null): string => {
        if (!img) return placeholder;

        if (img.base64) {
            const s = img.base64.trim();
            let mime = 'image/jpeg';
            if (s.startsWith('iVBOR')) mime = 'image/png';
            else if (s.startsWith('Qk')) mime = 'image/bmp';
            return byteaToImage(s.replace(/\s+/g, ''), mime);
        }

        if (img.id) return `/api/media/${img.id}`;
        return placeholder;
    };

    if (loading)
        return (
            <div className="p-6 md:min-h-screen">
                <LoadingSkeleton count={3} />
            </div>
        );

    if (error)
        return (
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
        );

    if (!product)
        return (
            <div className="p-6 md:min-h-screen flex items-center justify-center">
                <div className="text-center text-[#9aa0c7]">
                    {t('noProducts')}
                </div>
            </div>
        );

    const hasMultiple = orderedImages.length > 1;
    const isAvailable = CanBeAddToCart(product);

    return (
        <div className="bg-gradient-to-b p-4 md:p-6 min-h-screen">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-[#9aa0c7] hover:text-white transition-colors group"
                aria-label="back"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-10 items-start">
                {/* Left: Images*/}
                <div className="col-span-12 lg:col-span-5">
                    {hasMultiple ? (
                        <div className="w-full">
                            <div className="relative group overflow-hidden rounded-2xl">
                                <img
                                    src={getSrc(orderedImages[currentIndex])}
                                    alt={product.name}
                                    className="w-full aspect-square object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
                                />
                                <button
                                    aria-label="previous"
                                    onClick={() =>
                                        setCurrentIndex(
                                            (currentIndex - 1 + orderedImages.length) %
                                                orderedImages.length
                                        )
                                    }
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    aria-label="next"
                                    onClick={() =>
                                        setCurrentIndex(
                                            (currentIndex + 1) % orderedImages.length
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {orderedImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`flex-shrink-0 rounded-lg transition-all duration-200 ${
                                            idx === currentIndex
                                                ? 'ring-2 ring-white scale-100'
                                                : 'opacity-50 hover:opacity-75'
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
                        <img
                            src={getSrc(orderedImages[0])}
                            alt={product.name}
                            className="w-full aspect-square object-cover rounded-2xl shadow-xl"
                        />
                    )}
                </div>

                {/* Middle: Details */}
                <div className="col-span-12 lg:col-span-4 flex flex-col justify-start gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">{product.name}</h1>
                        <p className="text-sm lg:text-base text-[#9aa0c7] leading-relaxed line-clamp-4">
                            {product.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs text-[#9aa0c7] uppercase tracking-widest font-semibold">
                            {product.isService ? t('service') : t('product')}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-[#9aa0c7] bg-clip-text text-transparent">
                                {formatCurrency(product.price)}
                            </span>
                        </div>
                    </div>

                    {product.stock > 0 && product.stock < 10 && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-sm text-yellow-300 font-medium">
                                {t('onlyNLeft', { count: product.stock })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: Add to Cart */}
                <div className="col-span-12 lg:col-span-3 flex flex-col justify-start gap-4 sticky top-6">
                    <div className="space-y-3">
                        <div className="rounded-xl p-4 border border-white/5">
                            <div className="text-xs mb-2 uppercase tracking-wide">{t('total')}</div>
                            <div className="text-3xl font-bold">
                                {formatCurrency(product.price)}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <AddToCartButton
                            disabled={!isAvailable}
                            productId={product.id}
                            text={isAvailable ? t('addToCart') : t('unavailable')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
