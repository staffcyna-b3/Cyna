import type { BackOfficePromotion } from '../promotion';

export interface BackOfficePromotionsStoreState {
    items: BackOfficePromotion[];
    current: BackOfficePromotion | null;
    loading: boolean;
    error: string | null;
}
