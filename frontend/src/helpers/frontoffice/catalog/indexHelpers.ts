import { TFunction } from 'i18next';
import { CatalogListResponse } from '@/types/interfaces/catalog/CatalogListResponse';
import { CatalogContextProps } from '@/types/interfaces/catalog/CatalogContextProps';
import { CatalogSortBy } from '@/types/enums/catalog/CatalogSortBy';
import { SortOrder } from '@/types/enums/SortOrder';
import { getServiceAbbreviation } from './detailHelpers';

export function getCatalogHeaderContent(
    data: CatalogListResponse | null,
    t: TFunction
): { name: string; description: string; abbreviation: string } {
    const firstProduct = data?.rows?.[0];
    const category = firstProduct?.category;
    const name = category?.name?.trim() || t('allProducts');
    const description = t(`categories.${category?.description?.trim() || t('catalogBannerDefaultDescription')}`);

    return {
        name,
        description,
        abbreviation: getServiceAbbreviation(name),
    };
}

export function buildSortValue(
    sortBy: CatalogSortBy | undefined,
    sortOrder: SortOrder | undefined
): string | '' {
    if (!sortBy) return '';
    return `${sortBy}:${sortOrder ?? SortOrder.ASC}`;
}

export function parseSortValue(value: string | ''): {
    sortBy: CatalogSortBy | undefined;
    sortOrder: SortOrder | undefined;
} {
    if (!value) return { sortBy: undefined, sortOrder: undefined };

    const [sortBy, sortOrder] = value.split(':');

    return {
        sortBy: sortBy as CatalogSortBy,
        sortOrder: sortOrder === 'desc' ? SortOrder.DESC : SortOrder.ASC,
    };
}

export function getPriceBounds(data: CatalogListResponse | null): {
    dataMin: number;
    dataMax: number;
} {
    const prices = (data?.rows ?? []).map((row) => row.price);

    return {
        dataMin: prices.length ? Math.min(...prices) : 0,
        dataMax: prices.length ? Math.max(...prices) : 1000,
    };
}

export function getActiveFilterCount(
    ctx: CatalogContextProps,
    sliderMin: number,
    sliderMax: number
): number {
    let count = 0;

    if (
        (ctx.minPrice !== undefined && ctx.minPrice > sliderMin) ||
        (ctx.maxPrice !== undefined && ctx.maxPrice < sliderMax)
    ) {
        count += 1;
    }

    if (ctx.inStock !== undefined) count += 1;
    if (ctx.isService !== undefined) count += 1;
    if (ctx.sortBy !== undefined) count += 1;
    if (ctx.search && ctx.search.trim().length > 0) count += 1;

    return count;
}

export function getCurrentSortLabel(
    sortBy: CatalogSortBy | undefined,
    sortOrder: SortOrder | undefined,
    t: TFunction
): string {
    if (!sortBy) return t('sortBy');
    if (sortBy === CatalogSortBy.PRICE && sortOrder === SortOrder.DESC) return t('priceDesc');
    if (sortBy === CatalogSortBy.PRICE) return t('priceAsc');
    if (sortBy === CatalogSortBy.PRIORITY) return t('priority');
    return t('sortBy');
}
