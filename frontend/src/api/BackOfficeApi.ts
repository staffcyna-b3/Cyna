import type {
    BackOfficeCategory,
    BackOfficeCategoryOption,
    BackOfficeCategoryQuery,
} from '@/types/interfaces/backoffice/category';
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
import type {
    BackOfficePromotion,
    CreatePromotionPayload,
    PromotionProductsPayload,
    SetPromotionActivePayload,
    UpdatePromotionPayload,
} from '@/types/interfaces/backoffice/promotion';
import type { IBackOfficeApi } from '@/types/interfaces/backoffice/IBackOfficeApi';
import { buildQueryString } from '@/utils/backoffice/buildQueryString';
import { AbstractApi } from './AbstractApi';

export class BackOfficeApi extends AbstractApi implements IBackOfficeApi {
    private static instance: BackOfficeApi;

    private constructor() {
        super();
    }

    static getInstance(): BackOfficeApi {
        if (!BackOfficeApi.instance) {
            BackOfficeApi.instance = new BackOfficeApi();
        }

        return BackOfficeApi.instance;
    }

    async listProducts(query: BackOfficeProductQuery = {}): Promise<BackOfficeProduct[]> {
        return this.get<BackOfficeProduct[]>(`/back-office/products${buildQueryString(query as Record<string, unknown>)}`);
    }

    async getProductById(productId: string): Promise<BackOfficeProduct> {
        return this.get<BackOfficeProduct>(`/back-office/products/${productId}`);
    }

    async createSaasProduct(payload: CreateSaasProductPayload): Promise<BackOfficeProduct> {
        return this.post<BackOfficeProduct>('/back-office/products/saas', { body: payload });
    }

    async createPhysicalProduct(payload: CreatePhysicalProductPayload): Promise<BackOfficeProduct> {
        return this.post<BackOfficeProduct>('/back-office/products/physical', { body: payload });
    }

    async updateProduct(productId: string, payload: UpdateProductPayload): Promise<BackOfficeProduct> {
        return this.put<BackOfficeProduct>(`/back-office/products/${productId}`, { body: payload });
    }

    async deleteProduct(productId: string): Promise<{ deleted: boolean }> {
        return this.delete<{ deleted: boolean }>(`/back-office/products/${productId}`);
    }

    async updateProductStock(productId: string, payload: UpdateProductStockPayload): Promise<BackOfficeProduct> {
        return this.patch<BackOfficeProduct>(`/back-office/products/${productId}/stock`, { body: payload });
    }

    async setProductMaintenance(productId: string, payload: SetProductMaintenancePayload): Promise<BackOfficeProduct> {
        return this.patch<BackOfficeProduct>(`/back-office/products/${productId}/maintenance`, { body: payload });
    }

    async updateProductPriority(productId: string, payload: UpdateProductPriorityPayload): Promise<BackOfficeProduct> {
        return this.patch<BackOfficeProduct>(`/back-office/products/${productId}/priority`, { body: payload });
    }

    async reorderProductDisplayPriority(payload: ReorderProductPriorityPayload): Promise<BackOfficeProduct[]> {
        return this.patch<BackOfficeProduct[]>('/back-office/products/display-priority', { body: payload });
    }

    async getProductImage(productId: string): Promise<BackOfficeProductImage> {
        return this.get<BackOfficeProductImage>(`/back-office/products/${productId}/image`);
    }

    async updateProductImage(productId: string, payload: UpdateProductImagePayload): Promise<BackOfficeProductImage> {
        return this.put<BackOfficeProductImage>(`/back-office/products/${productId}/image`, { body: payload });
    }

    async listCategories(query: BackOfficeCategoryQuery = {}): Promise<BackOfficeCategory[]> {
        return this.get<BackOfficeCategory[]>(`/back-office/categories${buildQueryString(query as Record<string, unknown>)}`);
    }

    async listCategoryOptions(query: BackOfficeCategoryQuery = {}): Promise<BackOfficeCategoryOption[]> {
        return this.get<BackOfficeCategoryOption[]>(`/back-office/categories/select-options${buildQueryString(query as Record<string, unknown>)}`);
    }

    async getCategoryById(categoryId: string): Promise<BackOfficeCategory> {
        return this.get<BackOfficeCategory>(`/back-office/categories/${categoryId}`);
    }

    async listPromotions(): Promise<BackOfficePromotion[]> {
        return this.get<BackOfficePromotion[]>('/back-office/promotions');
    }

    async getPromotionById(promotionId: string): Promise<BackOfficePromotion> {
        return this.get<BackOfficePromotion>(`/back-office/promotions/${promotionId}`);
    }

    async createPromotion(payload: CreatePromotionPayload): Promise<BackOfficePromotion> {
        return this.post<BackOfficePromotion>('/back-office/promotions', { body: payload });
    }

    async updatePromotion(promotionId: string, payload: UpdatePromotionPayload): Promise<BackOfficePromotion> {
        return this.put<BackOfficePromotion>(`/back-office/promotions/${promotionId}`, { body: payload });
    }

    async deletePromotion(promotionId: string): Promise<{ deleted: boolean }> {
        return this.delete<{ deleted: boolean }>(`/back-office/promotions/${promotionId}`);
    }

    async setPromotionActive(promotionId: string, payload: SetPromotionActivePayload): Promise<BackOfficePromotion> {
        return this.patch<BackOfficePromotion>(`/back-office/promotions/${promotionId}/active`, { body: payload });
    }

    async replacePromotionProducts(promotionId: string, payload: PromotionProductsPayload): Promise<BackOfficePromotion> {
        return this.put<BackOfficePromotion>(`/back-office/promotions/${promotionId}/products`, { body: payload });
    }

    async addPromotionProducts(promotionId: string, payload: PromotionProductsPayload): Promise<BackOfficePromotion> {
        return this.post<BackOfficePromotion>(`/back-office/promotions/${promotionId}/products`, { body: payload });
    }

    async removePromotionProduct(promotionId: string, productId: string): Promise<BackOfficePromotion> {
        return this.delete<BackOfficePromotion>(`/back-office/promotions/${promotionId}/products/${productId}`);
    }
}

