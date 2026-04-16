import { BackOfficeService } from '@/services/BackOfficeService';
import type {
    BackOfficeProductImage,
    BackOfficeProduct,
    BackOfficeProductQuery,
    CreatePhysicalProductPayload,
    CreateSaasProductPayload,
    ReorderProductPriorityPayload,
    SetProductMaintenancePayload,
    UpdateProductImagePayload,
    UpdateProductPayload,
    UpdateProductPriorityPayload,
    UpdateProductStockPayload,
} from '@/types/interfaces/backoffice/product';
import type { BackOfficeProductsStoreState } from '@/types/interfaces/backoffice/store/BackOfficeProductsStoreState';
import { createStore, createStoreHook } from './createStore';
import { getErrorMessage, setStoreError, setStoreLoading } from './storeUtils';

const service = BackOfficeService.getInstance();
const store = createStore<BackOfficeProductsStoreState>({
    items: [],
    current: null,
    loading: false,
    error: null,
});

export const useBackOfficeProductsStore = createStoreHook(store);

export async function fetchBackOfficeProducts(query: BackOfficeProductQuery = {}): Promise<BackOfficeProduct[]> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const items = await service.listProducts(query);
        store.setState({ items });
        return items;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function fetchBackOfficeProductById(productId: string): Promise<BackOfficeProduct> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const current = await service.getProductById(productId);
        store.setState({ current });
        return current;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function createBackOfficeSaasProduct(payload: CreateSaasProductPayload): Promise<BackOfficeProduct> {
    const product = await service.createSaasProduct(payload);
    store.setState({ items: [product, ...store.getState().items], current: product });
    return product;
}

export async function createBackOfficePhysicalProduct(payload: CreatePhysicalProductPayload): Promise<BackOfficeProduct> {
    const product = await service.createPhysicalProduct(payload);
    store.setState({ items: [product, ...store.getState().items], current: product });
    return product;
}

export async function updateBackOfficeProduct(productId: string, payload: UpdateProductPayload): Promise<BackOfficeProduct> {
    const updated = await service.updateProduct(productId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === productId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function deleteBackOfficeProduct(productId: string): Promise<void> {
    await service.deleteProduct(productId);
    const nextItems = store.getState().items.filter((item) => item.id !== productId);
    const nextCurrent = store.getState().current?.id === productId ? null : store.getState().current;
    store.setState({ items: nextItems, current: nextCurrent });
}

export async function updateBackOfficeProductStock(productId: string, payload: UpdateProductStockPayload): Promise<BackOfficeProduct> {
    const updated = await service.updateProductStock(productId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === productId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function setBackOfficeProductMaintenance(productId: string, payload: SetProductMaintenancePayload): Promise<BackOfficeProduct> {
    const updated = await service.setProductMaintenance(productId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === productId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function updateBackOfficeProductPriority(productId: string, payload: UpdateProductPriorityPayload): Promise<BackOfficeProduct> {
    const updated = await service.updateProductPriority(productId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === productId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function reorderBackOfficeProductsPriority(payload: ReorderProductPriorityPayload): Promise<BackOfficeProduct[]> {
    const items = await service.reorderProductDisplayPriority(payload);
    store.setState({ items });
    return items;
}

export async function fetchBackOfficeProductImage(productId: string): Promise<BackOfficeProductImage> {
    return service.getProductImage(productId);
}

export async function updateBackOfficeProductImage(
    productId: string,
    payload: UpdateProductImagePayload,
): Promise<BackOfficeProductImage> {
    return service.updateProductImage(productId, payload);
}

