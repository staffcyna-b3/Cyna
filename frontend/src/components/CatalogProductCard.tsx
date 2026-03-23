import { ProductStatus } from '../types/enums/product/ProductStatus';
import { CatalogResponse } from '../types/interfaces/catalog/CatalogResponse';
import byteaToImage from '../utils/byteaToImage';
import { useTranslation } from 'react-i18next';
import AddToCartButton from './ui/AddToCartButton';
import { ProductPictureResponse } from '../types/interfaces/catalog/ProductPictureResponse';
import { ExtPicture } from '../types/ExtPicture';
import { formatCurrency } from '@/utils/currencyFormatter';
import placeholder from '@/assets/pictures/placeholder.svg';
import { useState } from 'react';
import PeriodModal from './ui/PeriodModal';
import CanBeAddToCart from '@/hooks/canBeAddToCart';
import { Link } from './ui/link';

export const CatalogProductCard = ({
    product,
}: {
    product: CatalogResponse;
}) => {
    const { t } = useTranslation();
    const mainImage =
        product.images?.find((i) => i.isMain) ?? product.images?.[0];

    const [showPeriodModal, setShowPeriodModal] = useState(false);

    const imgSrc = (() => {
        if (!mainImage) return placeholder;
        const anyImg =
            mainImage as unknown as ExtPicture<ProductPictureResponse>;
        const maybeData =
            anyImg.data ?? anyImg.base64 ?? anyImg.bytea ?? anyImg.hex;
        if (maybeData) {
            // allow caller to specify mime type on the image object
            return byteaToImage(maybeData, anyImg.mime || 'image/png');
        }
        if (anyImg.url) return anyImg.url;
        if (mainImage.id) return `/api/media/${mainImage.id}`;
        return placeholder;
    })();

    const unavailable = product.status === ProductStatus.UNAVAILABLE;

    return (
        <Link to={`/catalog/${product.id}`}>
            <article
                className={
                    'relative bg-gradient-to-b from-[#0f0b1a] to-[#171026] shadow-lg rounded-xl overflow-hidden text-white w-full sm:w-72 md:w-80 ' +
                    (unavailable ? 'opacity-70 grayscale' : '')
                }
            >
                <div className="relative h-44 bg-gradient-to-r from-[#0d0a16] to-[#1b1630] flex items-center justify-center">
                    {product.isService ? (
                        <span className="absolute left-3 top-3 px-2 py-1 bg-gradient-to-r from-[#ff7a59] to-[#ffb86b] text-xs font-semibold rounded-md text-[#210b00]">
                            {t('service')}
                        </span>
                    ) : (
                        <span className="absolute left-3 top-3 px-2 py-1 bg-gradient-to-r from-[#58d68d] to-[#2ebf7b] text-xs font-semibold rounded-md text-[#05210a]">
                            {t('product')}
                        </span>
                    )}

                    {unavailable && (
                        <span className="absolute right-3 top-3 px-2 py-1 bg-[#1b1f2b] text-xs rounded-md text-[#9aa0c7]">
                            {t('unavailable')}
                        </span>
                    )}

                    <img
                        className="w-full h-full object-cover"
                        src={imgSrc}
                        alt={
                            (
                                mainImage as unknown as ExtPicture<ProductPictureResponse>
                            )?.altText ?? product.name
                        }
                    />
                </div>

                <div className="p-4 flex flex-col gap-2">
                    <div className="text-xs text-[#9aa0c7]"></div>
                    <h3 className="text-lg font-semibold leading-snug">
                        {product.name}
                    </h3>
                    <p className="text-sm text-[#b7bdd9] min-h-[3rem]">
                        {product.description}
                    </p>
                    <div className="text-sm text-[#9aa0c7]">
                        {unavailable ? (
                            <span className="text-[#9aa0c7]">
                                {t('unavailable')}
                            </span>
                        ) : product.isService ? (
                            <span className="text-sm text-[#9aa0c7]">&nbsp;</span>
                        ) : // produit: n'afficher le stock que s'il est inférieur à 10 (et > 0)
                        product.stock === 0 ? (
                            <span className="text-red-400 font-semibold">
                                {t('unavailable')}
                            </span>
                        ) : product.stock < 10 ? (
                            <span className="text-yellow-300">
                                {t('onlyNLeft', { count: product.stock })}
                            </span>
                        ) : (
                            <span className="text-sm text-[#9aa0c7]">&nbsp;</span>
                        )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="text-xl font-extrabold">
                            {formatCurrency(product.price)}
                        </div>
                        <div className="flex items-center gap-3">
                            {product.isService ? (
                                <>
                                    <AddToCartButton
                                        disabled={!CanBeAddToCart(product)}
                                        productId={product.id}
                                        onClick={() => setShowPeriodModal(true)}
                                    />
                                    <PeriodModal open={showPeriodModal} onClose={() => setShowPeriodModal(false)} productId={product.id} />
                                </>
                            ) : ( 
                                <>
                                    <AddToCartButton
                                            disabled={!CanBeAddToCart(product)}
                                            productId={product.id}
                                            quantity={1}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default CatalogProductCard;
