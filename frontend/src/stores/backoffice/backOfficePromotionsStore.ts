import { BackOfficeService } from '@/services/BackOfficeCatalogService';
import type {
    BackOfficePromotion,
    CreatePromotionPayload,
    PromotionProductsPayload,
    SetPromotionActivePayload,
    UpdatePromotionPayload,
} from '@/types/interfaces/backoffice/promotion';
import type { BackOfficePromotionsStoreState } from '@/types/interfaces/backoffice/store/BackOfficePromotionsStoreState';
import { createStore, createStoreHook } from './createStore';
import { getErrorMessage, setStoreError, setStoreLoading } from './storeUtils';

const service = BackOfficeService.getInstance();
const store = createStore<BackOfficePromotionsStoreState>({
    items: [],
    current: null,
    loading: false,
    error: null,
});

export const useBackOfficePromotionsStore = createStoreHook(store);

export async function fetchBackOfficePromotions(): Promise<BackOfficePromotion[]> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const items = await service.listPromotions();
        store.setState({ items });
        return items;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function fetchBackOfficePromotionById(promotionId: string): Promise<BackOfficePromotion> {
    try {
        setStoreLoading(store, true);
        setStoreError(store, null);
        const current = await service.getPromotionById(promotionId);
        store.setState({ current });
        return current;
    } catch (error: unknown) {
        setStoreError(store, getErrorMessage(error));
        throw error;
    } finally {
        setStoreLoading(store, false);
    }
}

export async function createBackOfficePromotion(payload: CreatePromotionPayload): Promise<BackOfficePromotion> {
    const promotion = await service.createPromotion(payload);
    store.setState({ items: [promotion, ...store.getState().items], current: promotion });
    return promotion;
}

export async function updateBackOfficePromotion(promotionId: string, payload: UpdatePromotionPayload): Promise<BackOfficePromotion> {
    const updated = await service.updatePromotion(promotionId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === promotionId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function deleteBackOfficePromotion(promotionId: string): Promise<void> {
    await service.deletePromotion(promotionId);
    const nextItems = store.getState().items.filter((item) => item.id !== promotionId);
    const nextCurrent = store.getState().current?.id === promotionId ? null : store.getState().current;
    store.setState({ items: nextItems, current: nextCurrent });
}

export async function setBackOfficePromotionActive(
    promotionId: string,
    payload: SetPromotionActivePayload,
): Promise<BackOfficePromotion> {
    const updated = await service.setPromotionActive(promotionId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === promotionId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function replaceBackOfficePromotionProducts(
    promotionId: string,
    payload: PromotionProductsPayload,
): Promise<BackOfficePromotion> {
    const updated = await service.replacePromotionProducts(promotionId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === promotionId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function addBackOfficePromotionProducts(
    promotionId: string,
    payload: PromotionProductsPayload,
): Promise<BackOfficePromotion> {
    const updated = await service.addPromotionProducts(promotionId, payload);
    const nextItems = store.getState().items.map((item) => (item.id === promotionId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

export async function removeBackOfficePromotionProduct(
    promotionId: string,
    productId: string,
): Promise<BackOfficePromotion> {
    const updated = await service.removePromotionProduct(promotionId, productId);
    const nextItems = store.getState().items.map((item) => (item.id === promotionId ? updated : item));
    store.setState({ items: nextItems, current: updated });
    return updated;
}

