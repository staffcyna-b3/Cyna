import { JSX, useMemo, useState } from 'react';
import { ProductImageGalleryProps } from '@/types/interfaces/catalog/ProductImageGalleryProps';
import { getProductImageSrc, sortProductImages } from '@/helpers/frontoffice/catalog/detailHelpers';

export default function ProductImageGallery({
    productName,
    images,
    t,
}: ProductImageGalleryProps): JSX.Element {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const orderedImages = useMemo(() => sortProductImages(images), [images]);

    const hasMultiple = orderedImages.length > 1;

    if (!orderedImages.length) {
        return (
            <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-[#7b61ff]/20 to-[#2b6ef6]/20 group-hover:from-[#7b61ff]/30 group-hover:to-[#2b6ef6]/30 transition-all duration-300 z-10 pointer-events-none" />
                <img
                    src={getProductImageSrc(null)}
                    alt={productName}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl shadow-[#7b61ff]/20 group-hover:shadow-[#7b61ff]/40 group-hover:scale-105 transition-all duration-300"
                />
            </div>
        );
    }

    if (!hasMultiple) {
        return (
            <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-[#7b61ff]/20 to-[#2b6ef6]/20 group-hover:from-[#7b61ff]/30 group-hover:to-[#2b6ef6]/30 transition-all duration-300 z-10 pointer-events-none" />
                <img
                    src={getProductImageSrc(orderedImages[0])}
                    alt={productName}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl shadow-[#7b61ff]/20 group-hover:shadow-[#7b61ff]/40 group-hover:scale-105 transition-all duration-300"
                />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-[#7b61ff]/20 to-[#2b6ef6]/20 group-hover:from-[#7b61ff]/30 group-hover:to-[#2b6ef6]/30 transition-all duration-300 z-10 pointer-events-none" />
                <img
                    src={getProductImageSrc(orderedImages[currentIndex])}
                    alt={productName}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl shadow-[#7b61ff]/20 group-hover:shadow-[#7b61ff]/40 group-hover:scale-105 transition-all duration-300"
                />
                <button
                    aria-label={t('previous')}
                    onClick={() =>
                        setCurrentIndex(
                            (currentIndex - 1 + orderedImages.length) % orderedImages.length
                        )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-linear-to-r from-[#7b61ff] to-[#2b6ef6] hover:shadow-lg hover:shadow-[#7b61ff]/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    aria-label={t('next')}
                    onClick={() =>
                        setCurrentIndex((currentIndex + 1) % orderedImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-linear-to-r from-[#7b61ff] to-[#2b6ef6] hover:shadow-lg hover:shadow-[#7b61ff]/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {orderedImages.map((image, index) => (
                    <button
                        key={image.id || index}
                        onClick={() => setCurrentIndex(index)}
                        className={`shrink-0 rounded-lg transition-all duration-300 ${
                            index === currentIndex
                                ? 'ring-2 ring-[#7b61ff] scale-100 shadow-lg shadow-[#7b61ff]/40'
                                : 'opacity-60 hover:opacity-90'
                        }`}
                    >
                        <img
                            src={getProductImageSrc(image)}
                            alt={`${productName}-${index}`}
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
