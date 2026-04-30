import LignePromotion from '../models/LignePromotion';
import Product from '../models/Product';
import Promotion, { PromotionCreationAttributes } from '../models/Promotion';

export interface IPromotionRepository {
    list(): Promise<Promotion[]>;
    findById(id: string): Promise<Promotion | null>;
    findByCode(code: string, excludeId?: string): Promise<Promotion | null>;
    create(payload: PromotionCreationAttributes): Promise<Promotion>;
    update(promotion: Promotion, payload: Partial<PromotionCreationAttributes>): Promise<Promotion>;
    delete(promotion: Promotion): Promise<void>;
    deleteProductLinks(promotionId: string): Promise<void>;
    replaceProductLinks(promotionId: string, productIds: string[]): Promise<void>;
    findExistingProductLinks(promotionId: string, productIds: string[]): Promise<LignePromotion[]>;
    addProductLinks(promotionId: string, productIds: string[]): Promise<void>;
    removeProductLink(promotionId: string, productId: string): Promise<void>;
    findProductsByIds(productIds: string[]): Promise<Product[]>;
}
