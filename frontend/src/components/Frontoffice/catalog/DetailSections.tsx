import { JSX, useState } from 'react';
import AddToCartButton from '@/components/Frontoffice/AddToCartButton';
import ProductTypeBadge from '@/components/ProductTypeBadge';
import ServiceDetailLayout from '@/components/Frontoffice/layout/ServiceDetailLayout';
import { formatCurrency } from '@/utils/currencyFormatter';
import {
    DetailSectionProps,
    AddToCartPanelProps,
} from '@/types/interfaces/catalog/DetailSectionProps';
import ProductImageGallery from './ProductImageGallery';
import { getServiceAbbreviation } from '@/helpers/frontoffice/catalog/detailHelpers';
import { Period } from '@/types/Period';
import { PeriodEnum } from '@/types/enums/Period';

const PERIOD_OPTIONS: { value: Period; labelKey: string }[] = [
    { value: PeriodEnum.ThreeMonths, labelKey: 'threeMonths' },
    { value: PeriodEnum.SixMonths,   labelKey: 'sixMonths'   },
    { value: PeriodEnum.OneYear,     labelKey: 'oneYear'     },
];

function AddToCartPanel({
    product,
    isAvailable,
    unavailableLabel,
    t,
}: AddToCartPanelProps): JSX.Element {
    const translatedName = t(`products.${product.name}.name`);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>(PeriodEnum.ThreeMonths);

    return (
        <div className="flex flex-col gap-3 pt-4">
            <div className="rounded-xl p-5 border border-white/10 bg-linear-to-br from-white/5 to-transparent hover:border-white/20 transition-colors">
                <div className="text-xs mb-2 uppercase tracking-wide text-[#9aa0c7]">
                    {t('total')}
                </div>
                {product.discountedPrice ? (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-4xl font-black text-red-500">
                            {formatCurrency(product.discountedPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-green-400 font-medium">
                            -{product.discountValue}%
                        </span>
                    </div>
                ) : (
                    <div className="text-4xl font-black text-transparent bg-linear-to-r from-white to-[#7b61ff] bg-clip-text">
                        {formatCurrency(product.price)}
                    </div>
                )}
            </div>

            {product.isService && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wide text-[#9aa0c7]">
                        {t('selectPeriod')}
                    </span>
                    <div className="flex gap-2">
                        {PERIOD_OPTIONS.map(({ value, labelKey }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setSelectedPeriod(value)}
                                className={
                                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
                                    (selectedPeriod === value
                                        ? 'bg-[#372CCA] text-white'
                                        : 'bg-white/5 text-[#b7bdd9] hover:bg-white/10')
                                }
                            >
                                {t(labelKey)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {product.isService ? (
                <AddToCartButton
                    disabled={!isAvailable}
                    productId={product.id}
                    name={product.name}
                    unitPrice={product.price}
                    discountedUnitPrice={product.discountedPrice ?? undefined}
                    isService={true}
                    period={selectedPeriod}
                    text={isAvailable ? t('addToCart') : unavailableLabel}
                />
            ) : (
                <AddToCartButton
                    disabled={!isAvailable}
                    productId={product.id}
                    name={product.name}
                    unitPrice={product.price}
                    discountedUnitPrice={product.discountedPrice ?? undefined}
                    isService={false}
                    stock={product.stock}
                    text={isAvailable ? t('addToCart') : unavailableLabel}
                />
            )}
        </div>
    );
}

export function ServiceDetailSection({
    product,
    t,
    isAvailable,
    unavailableLabel,
}: DetailSectionProps): JSX.Element {
    const translatedName = t(`products.${product.name}.name`);
    const abbreviation = getServiceAbbreviation(translatedName);

    return (
        <ServiceDetailLayout
            title={translatedName}
            description={t(`products.${product.name}.description`)}
            abbreviation={abbreviation}
            badge={<ProductTypeBadge isService={true} />}
        >
            <div className="space-y-3 pt-4">
                <div className="text-xs text-[#9aa0c7] uppercase tracking-widest font-semibold">
                    {t('pricing')}
                </div>
                {product.discountedPrice ? (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-5xl lg:text-6xl font-black text-red-500">
                            {formatCurrency(product.discountedPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-green-400 font-medium">
                            -{product.discountValue}%
                        </span>
                    </div>
                ) : (
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl lg:text-6xl font-black text-transparent bg-linear-to-r from-white to-[#7b61ff] bg-clip-text">
                            {formatCurrency(product.price)}
                        </span>
                    </div>
                )}
            </div>

            {product.duration && (
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-linear-to-r from-[#7b61ff]/10 to-[#2b6ef6]/10 border border-[#7b61ff]/40 rounded-lg hover:border-[#7b61ff]/60 transition-colors">
                    <div className="w-2 h-2 bg-linear-to-r from-[#7b61ff] to-[#2b6ef6] rounded-full animate-pulse" />
                    <span className="text-sm text-[#b7bdd9] font-medium">
                        {product.duration} {t('days')}
                    </span>
                </div>
            )}

            <AddToCartPanel
                product={product}
                isAvailable={isAvailable}
                unavailableLabel={unavailableLabel}
                t={t}
            />
        </ServiceDetailLayout>
    );
}

export function PhysicalProductDetailSection({
    product,
    t,
    isAvailable,
    unavailableLabel,
}: DetailSectionProps): JSX.Element {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-10 items-center py-8 md:py-12">
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center gap-6">
                <div className="space-y-4">
                    <div className="inline-block">
                        <ProductTypeBadge isService={false} />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black leading-tight">
                        <span className="text-transparent bg-linear-to-r from-white via-[#e0e7ff] to-[#c7d2fe] bg-clip-text">
                            {t(`products.${product.name}.name`)}
                        </span>
                    </h1>
                    <p className="text-base text-[#b7bdd9] leading-relaxed line-clamp-4">
                        {t(`products.${product.name}.description`)}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="text-xs text-[#9aa0c7] uppercase tracking-widest font-semibold">
                        {t('pricing')}
                    </div>
                    {product.discountedPrice ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-5xl font-black text-red-500">
                                {formatCurrency(product.discountedPrice)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(product.price)}
                            </span>
                            <span className="text-xs text-green-400 font-medium">
                                -{product.discountValue}%
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-transparent bg-linear-to-r from-white to-[#7b61ff] bg-clip-text">
                                {formatCurrency(product.price)}
                            </span>
                        </div>
                    )}
                </div>

                {product.stock > 0 && product.stock < 10 && (
                    <div className="inline-flex items-center gap-2 px-4 py-3 bg-linear-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/40 rounded-lg hover:border-yellow-500/60 transition-colors">
                        <div className="w-2 h-2 bg-linear-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                        <span className="text-sm text-yellow-300 font-medium">
                            {t('onlyNLeft', { count: product.stock })}
                        </span>
                    </div>
                )}

                <AddToCartPanel
                    product={product}
                    isAvailable={isAvailable}
                    unavailableLabel={unavailableLabel}
                    t={t}
                />
            </div>

            <div className="col-span-12 lg:col-span-6 flex items-center justify-center py-8 lg:py-0">
                <ProductImageGallery
                    productName={t(`products.${product.name}.name`)}
                    images={product.images}
                    t={t}
                />
            </div>
        </div>
    );
}
