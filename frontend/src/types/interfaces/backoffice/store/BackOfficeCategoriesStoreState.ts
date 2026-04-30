import type { BackOfficeCategory, BackOfficeCategoryOption } from '../category';

export interface BackOfficeCategoriesStoreState {
    items: BackOfficeCategory[];
    options: BackOfficeCategoryOption[];
    current: BackOfficeCategory | null;
    loading: boolean;
    error: string | null;
}
