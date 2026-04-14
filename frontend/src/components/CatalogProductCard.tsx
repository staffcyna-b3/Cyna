import { ProductStatus } from '../types/enums/product/ProductStatus';
import { CatalogResponse } from '../types/interfaces/catalog/CatalogResponse';
import byteaToImage from '../utils/byteaToImage';
import { useTranslation } from 'react-i18next';
import AddToCartButton from './ui/AddToCartButton';
import ProductTypeBadge from './ui/ProductTypeBadge';
import { ProductPictureResponse } from '../types/interfaces/catalog/ProductPictureResponse';
import { ExtPicture } from '../types/ExtPicture';
import { formatCurrency } from '@/utils/currencyFormatter';
import placeholder from '@/assets/pictures/placeholder.svg';
import { useState } from 'react';
import PeriodModal from './ui/PeriodModal';
import CanBeAddToCart from '@/hooks/canBeAddToCart';
import { useNavigate } from 'react-router-dom';

export const CatalogProductCard = ({
    product,
}: {
    product: CatalogResponse;
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
    const unavailableLabel = product.isService ? t('maintenance') : t('unavailable');

    return (
        <article
            onClick={() => navigate(`/catalog/${product.id}`)}
            className={
                    'cursor-pointer flex-none w-full sm:w-5/6 md:w-3/4 lg:w-3/5 max-w-full mx-auto h-[450px] relative shadow-lg rounded-xl overflow-hidden text-white transform-gpu transition-transform duration-200 ease-out hover:scale-[1.02] flex flex-col ' +
                    (unavailable ? 'opacity-70 grayscale' : '')
                }
                style={{ background: 'radial-gradient(circle at 15% 15%, #1e1a48 0%, #080618 65%)' }}
            >
                <div className="relative h-[180px] bg-gradient-to-r from-[#0d0a16] to-[#1b1630] flex items-center justify-center flex-shrink-0">
                    <ProductTypeBadge className="absolute left-3 top-3 px-2 py-1" isService={product.isService} />

                    {unavailable && (
                        <span className="absolute right-3 top-3 px-2 py-1 bg-[#1b1f2b] text-xs rounded-md text-[#9aa0c7]">
                            {unavailableLabel}
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

                <div className="p-4 flex flex-col gap-2 flex-1 overflow-hidden">
                    <h3 className="text-lg font-semibold leading-snug line-clamp-2 min-h-[56px]">
                        {product.name}
                    </h3>
                    <p className="text-sm text-[#b7bdd9] line-clamp-2 flex-1 min-h-[40px]">
                        {product.description}
                    </p>
                    <div className="text-sm text-[#9aa0c7] min-h-[20px]">
                        {unavailable ? (
                            <span className="text-[#9aa0c7]">
                                {unavailableLabel}
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
                    <div className="mt-auto flex items-center justify-between pt-2">
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
                                        skipAddToCart={true}
                                    />
                                    <PeriodModal
                                        open={showPeriodModal}
                                        onClose={() => setShowPeriodModal(false)}
                                        productId={product.id}
                                        productName={product.name}
                                        unitPrice={product.price}
                                    />
                                </>
                            ) : (
                                <>
                                    <AddToCartButton
                                            disabled={!CanBeAddToCart(product)}
                                            productId={product.id}
                                            quantity={1}
                                            name={product.name}
                                            unitPrice={product.price}
                                            isService={false}
                                            stock={product.stock}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </article>
    );
};

export default CatalogProductCard;
