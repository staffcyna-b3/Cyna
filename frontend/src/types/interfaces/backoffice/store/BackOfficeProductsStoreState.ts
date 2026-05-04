import type { BackOfficeProduct } from '../product';

export interface BackOfficeProductsStoreState {
    items: BackOfficeProduct[];
    current: BackOfficeProduct | null;
    loading: boolean;
    error: string | null;
}
