import { BackOfficeService } from '@/services/BackOfficeService';
import type {
    BackOfficeCategory,
    BackOfficeCategoryOption,
    BackOfficeCategoryQuery,
    ReorderCategoryPriorityPayload,
} from '@/types/interfaces/backoffice/category';
import type { BackOfficeCategoriesStoreState } from '@/types/interfaces/backoffice/store/BackOfficeCategoriesStoreState';
import { createStore, createStoreHook } from './createStore';
import { getErrorMessage, setStoreError, setStoreLoading } from './storeUtils';

const service = BackOfficeService.getInstance();
const store = createStore<BackOfficeCategoriesStoreState>({
    items: [],
    options: [],
    current: null,
    loading: false,
    error: null,
});

export const useBackOfficeCategoriesStore = createStoreHook(store);

export async function fetchBackOfficeCategories(query: BackOfficeCategoryQuery = {}): Promise<BackOfficeCategory[]> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const items = await service.listCategories(query);
        store.setState({ items });
        return items;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function fetchBackOfficeCategoryOptions(query: BackOfficeCategoryQuery = {}): Promise<BackOfficeCategoryOption[]> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const options = await service.listCategoryOptions(query);
        store.setState({ options });
        return options;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function fetchBackOfficeCategoryById(categoryId: string): Promise<BackOfficeCategory> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const current = await service.getCategoryById(categoryId);
        store.setState({ current });
        return current;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function reorderBackOfficeCategoriesPriority(
    payload: ReorderCategoryPriorityPayload,
): Promise<BackOfficeCategory[]> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const items = await service.reorderCategoryDisplayPriority(payload);
        store.setState({ items });
        return items;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

