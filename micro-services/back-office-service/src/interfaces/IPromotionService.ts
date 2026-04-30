import Promotion from '../models/Promotion';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/promotion';

export interface IPromotionService {
    list(): Promise<Promotion[]>;
    getById(id: string): Promise<Promotion>;
    create(input: CreatePromotionDto): Promise<Promotion>;
    update(id: string, input: UpdatePromotionDto): Promise<Promotion>;
    remove(id: string): Promise<{ deleted: boolean }>;
    setActive(id: string, active: boolean): Promise<Promotion>;
    replaceProducts(promotionId: string, productIds: string[]): Promise<Promotion>;
    addProducts(promotionId: string, productIds: string[]): Promise<Promotion>;
    removeProduct(promotionId: string, productId: string): Promise<Promotion>;
}

