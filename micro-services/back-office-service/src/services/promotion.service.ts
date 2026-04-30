import { HttpError } from '../common/httpError';
import { PromotionType } from '../enum/PromotionType';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/promotion';
import { IPromotionRepository } from '../interfaces/IPromotionRepository';
import { IPromotionService } from '../interfaces/IPromotionService';

export class PromotionService implements IPromotionService {
    constructor(private readonly promotionRepository: IPromotionRepository) { }

    async list() {
        return this.promotionRepository.list();
    }

    async getById(id: string) {
        const promotion = await this.promotionRepository.findById(id);

        if (!promotion) {
            throw new HttpError(404, 'Promotion introuvable');
        }

        return promotion;
    }

    async create(input: CreatePromotionDto) {
        this.validatePromotionData(input);

        const existing = await this.promotionRepository.findByCode(input.code.trim().toUpperCase());
        if (existing) {
            throw new HttpError(409, 'Ce code promotion existe deja');
        }

        const promotion = await this.promotionRepository.create({
            code: input.code.trim().toUpperCase(),
            discount_type: input.discount_type,
            discount_value: input.discount_value,
            active: input.active ?? true,
        });

        if (Array.isArray(input.product_ids) && input.product_ids.length > 0) {
            await this.replaceProducts(promotion.id, input.product_ids);
        }

        return this.getById(promotion.id);
    }

    async update(id: string, input: UpdatePromotionDto) {
        const promotion = await this.getById(id);

        if (input.code) {
            const normalizedCode = input.code.trim().toUpperCase();
            const existing = await this.promotionRepository.findByCode(normalizedCode, id);

            if (existing) {
                throw new HttpError(409, 'Ce code promotion existe deja');
            }

            input.code = normalizedCode;
        }

        if (input.discount_value !== undefined && (!Number.isFinite(input.discount_value) || input.discount_value <= 0)) {
            throw new HttpError(400, 'discount_value doit etre un nombre strictement positif');
        }

        await this.promotionRepository.update(promotion, input);
        return this.getById(id);
    }

    async remove(id: string) {
        const promotion = await this.getById(id);
        await this.promotionRepository.deleteProductLinks(id);
        await this.promotionRepository.delete(promotion);
        return { deleted: true };
    }

    async setActive(id: string, active: boolean) {
        const promotion = await this.getById(id);
        await this.promotionRepository.update(promotion, { active });
        return this.getById(id);
    }

    async replaceProducts(promotionId: string, productIds: string[]) {
        const promotion = await this.getById(promotionId);
        await this.validateProductBindings(promotion.discount_type, productIds);

        await this.promotionRepository.replaceProductLinks(promotionId, productIds);

        return this.getById(promotionId);
    }

    async addProducts(promotionId: string, productIds: string[]) {
        const promotion = await this.getById(promotionId);
        await this.validateProductBindings(promotion.discount_type, productIds);

        const existingLinks = await this.promotionRepository.findExistingProductLinks(promotionId, productIds);

        const existingProductIds = new Set(existingLinks.map((link) => link.product_id));
        const missingLinks = productIds.filter((id) => !existingProductIds.has(id));

        await this.promotionRepository.addProductLinks(promotionId, missingLinks);

        return this.getById(promotionId);
    }

    async removeProduct(promotionId: string, productId: string) {
        await this.getById(promotionId);
        await this.promotionRepository.removeProductLink(promotionId, productId);

        return this.getById(promotionId);
    }

    private validatePromotionData(input: CreatePromotionDto) {
        if (!input.code || input.code.trim().length < 3) {
            throw new HttpError(400, 'Le code promo doit contenir au moins 3 caracteres');
        }

        if (!Object.values(PromotionType).includes(input.discount_type)) {
            throw new HttpError(400, 'discount_type invalide');
        }

        if (!Number.isFinite(input.discount_value) || input.discount_value <= 0) {
            throw new HttpError(400, 'discount_value doit etre un nombre strictement positif');
        }
    }

    private async validateProductBindings(discountType: PromotionType, productIds: string[]) {
        if (!Array.isArray(productIds)) {
            throw new HttpError(400, 'product_ids doit etre un tableau');
        }

        if (productIds.length === 0) {
            return;
        }

        const products = await this.promotionRepository.findProductsByIds(productIds);

        if (products.length !== productIds.length) {
            throw new HttpError(400, 'Un ou plusieurs produits sont introuvables');
        }

        const hasInvalidType = products.some((product) => {
            if (discountType === PromotionType.SERVICE) {
                return !product.is_service;
            }
            return product.is_service;
        });

        if (hasInvalidType) {
            throw new HttpError(
                400,
                discountType === PromotionType.SERVICE
                    ? 'La promotion service ne peut cibler que des produits SaaS'
                    : 'La promotion product ne peut cibler que des produits physiques',
            );
        }
    }
}

