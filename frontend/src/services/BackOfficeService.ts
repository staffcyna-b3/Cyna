import { BackOfficeApi } from '@/api/BackOfficeApi';
import type {
    BackOfficeCategory,
    BackOfficeCategoryOption,
    BackOfficeCategoryQuery,
} from '@/types/interfaces/backoffice/category';
import type {
    BackOfficeProduct,
    BackOfficeProductImage,
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
import type { IBackOfficeService } from '@/types/interfaces/backoffice/IBackOfficeService';

export class BackOfficeService implements IBackOfficeService {
    private static instance: BackOfficeService;

    private readonly api: IBackOfficeApi;

    private constructor(api: IBackOfficeApi = BackOfficeApi.getInstance()) {
        this.api = api;
    }

    static getInstance(): BackOfficeService {
        if (!BackOfficeService.instance) {
            BackOfficeService.instance = new BackOfficeService();
        }

        return BackOfficeService.instance;
    }

    async listProducts(query: BackOfficeProductQuery = {}): Promise<BackOfficeProduct[]> {
        return this.api.listProducts(query);
    }

    async getProductById(productId: string): Promise<BackOfficeProduct> {
        return this.api.getProductById(productId);
    }

    async createSaasProduct(payload: CreateSaasProductPayload): Promise<BackOfficeProduct> {
        return this.api.createSaasProduct(payload);
    }

    async createPhysicalProduct(payload: CreatePhysicalProductPayload): Promise<BackOfficeProduct> {
        return this.api.createPhysicalProduct(payload);
    }

    async updateProduct(productId: string, payload: UpdateProductPayload): Promise<BackOfficeProduct> {
        return this.api.updateProduct(productId, payload);
    }

    async deleteProduct(productId: string): Promise<{ deleted: boolean }> {
        return this.api.deleteProduct(productId);
    }

    async updateProductStock(productId: string, payload: UpdateProductStockPayload): Promise<BackOfficeProduct> {
        return this.api.updateProductStock(productId, payload);
    }

    async setProductMaintenance(productId: string, payload: SetProductMaintenancePayload): Promise<BackOfficeProduct> {
        return this.api.setProductMaintenance(productId, payload);
    }

    async updateProductPriority(productId: string, payload: UpdateProductPriorityPayload): Promise<BackOfficeProduct> {
        return this.api.updateProductPriority(productId, payload);
    }

    async reorderProductDisplayPriority(payload: ReorderProductPriorityPayload): Promise<BackOfficeProduct[]> {
        return this.api.reorderProductDisplayPriority(payload);
    }

    async getProductImage(productId: string): Promise<BackOfficeProductImage> {
        return this.api.getProductImage(productId);
    }

    async updateProductImage(productId: string, payload: UpdateProductImagePayload): Promise<BackOfficeProductImage> {
        return this.api.updateProductImage(productId, payload);
    }

    async listCategories(query: BackOfficeCategoryQuery = {}): Promise<BackOfficeCategory[]> {
        return this.api.listCategories(query);
    }

    async listCategoryOptions(query: BackOfficeCategoryQuery = {}): Promise<BackOfficeCategoryOption[]> {
        return this.api.listCategoryOptions(query);
    }

    async getCategoryById(categoryId: string): Promise<BackOfficeCategory> {
        return this.api.getCategoryById(categoryId);
    }

    async listPromotions(): Promise<BackOfficePromotion[]> {
        return this.api.listPromotions();
    }

    async getPromotionById(promotionId: string): Promise<BackOfficePromotion> {
        return this.api.getPromotionById(promotionId);
    }

    async createPromotion(payload: CreatePromotionPayload): Promise<BackOfficePromotion> {
        return this.api.createPromotion(payload);
    }

    async updatePromotion(promotionId: string, payload: UpdatePromotionPayload): Promise<BackOfficePromotion> {
        return this.api.updatePromotion(promotionId, payload);
    }

    async deletePromotion(promotionId: string): Promise<{ deleted: boolean }> {
        return this.api.deletePromotion(promotionId);
    }

    async setPromotionActive(promotionId: string, payload: SetPromotionActivePayload): Promise<BackOfficePromotion> {
        return this.api.setPromotionActive(promotionId, payload);
    }

    async replacePromotionProducts(promotionId: string, payload: PromotionProductsPayload): Promise<BackOfficePromotion> {
        return this.api.replacePromotionProducts(promotionId, payload);
    }

    async addPromotionProducts(promotionId: string, payload: PromotionProductsPayload): Promise<BackOfficePromotion> {
        return this.api.addPromotionProducts(promotionId, payload);
    }

    async removePromotionProduct(promotionId: string, productId: string): Promise<BackOfficePromotion> {
        return this.api.removePromotionProduct(promotionId, productId);
    }
}

