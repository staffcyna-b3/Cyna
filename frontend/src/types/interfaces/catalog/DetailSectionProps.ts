import { TFunction } from 'i18next';
import { CatalogResponse } from './CatalogResponse';

export interface DetailSectionProps {
    product: CatalogResponse;
    t: TFunction;
    isAvailable: boolean;
    unavailableLabel: string;
}

export interface AddToCartPanelProps {
    product: CatalogResponse;
    isAvailable: boolean;
    unavailableLabel: string;
    t: TFunction;
}
