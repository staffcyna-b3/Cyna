import type {
    BackOfficeCategory,
    BackOfficeCategoryOption,
    BackOfficeCategoryQuery,
} from './category';
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
} from './product';
import type {
    BackOfficePromotion,
    CreatePromotionPayload,
    PromotionProductsPayload,
    SetPromotionActivePayload,
    UpdatePromotionPayload,
} from './promotion';

export interface IBackOfficeService {
    listProducts(query?: BackOfficeProductQuery): Promise<BackOfficeProduct[]>;
    getProductById(productId: string): Promise<BackOfficeProduct>;
    createSaasProduct(payload: CreateSaasProductPayload): Promise<BackOfficeProduct>;
    createPhysicalProduct(payload: CreatePhysicalProductPayload): Promise<BackOfficeProduct>;
    updateProduct(productId: string, payload: UpdateProductPayload): Promise<BackOfficeProduct>;
    deleteProduct(productId: string): Promise<{ deleted: boolean }>;
    updateProductStock(productId: string, payload: UpdateProductStockPayload): Promise<BackOfficeProduct>;
    setProductMaintenance(productId: string, payload: SetProductMaintenancePayload): Promise<BackOfficeProduct>;
    updateProductPriority(productId: string, payload: UpdateProductPriorityPayload): Promise<BackOfficeProduct>;
    reorderProductDisplayPriority(payload: ReorderProductPriorityPayload): Promise<BackOfficeProduct[]>;
    getProductImage(productId: string): Promise<BackOfficeProductImage>;
    updateProductImage(productId: string, payload: UpdateProductImagePayload): Promise<BackOfficeProductImage>;

    listCategories(query?: BackOfficeCategoryQuery): Promise<BackOfficeCategory[]>;
    listCategoryOptions(query?: BackOfficeCategoryQuery): Promise<BackOfficeCategoryOption[]>;
    getCategoryById(categoryId: string): Promise<BackOfficeCategory>;

    listPromotions(): Promise<BackOfficePromotion[]>;
    getPromotionById(promotionId: string): Promise<BackOfficePromotion>;
    createPromotion(payload: CreatePromotionPayload): Promise<BackOfficePromotion>;
    updatePromotion(promotionId: string, payload: UpdatePromotionPayload): Promise<BackOfficePromotion>;
    deletePromotion(promotionId: string): Promise<{ deleted: boolean }>;
    setPromotionActive(promotionId: string, payload: SetPromotionActivePayload): Promise<BackOfficePromotion>;
    replacePromotionProducts(promotionId: string, payload: PromotionProductsPayload): Promise<BackOfficePromotion>;
    addPromotionProducts(promotionId: string, payload: PromotionProductsPayload): Promise<BackOfficePromotion>;
    removePromotionProduct(promotionId: string, productId: string): Promise<BackOfficePromotion>;
}
