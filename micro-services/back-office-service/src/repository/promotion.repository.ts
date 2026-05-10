import { Op } from 'sequelize';
import Promotion, { PromotionCreationAttributes } from '../models/Promotion';
import Product from '../models/Product';
import LignePromotion from '../models/LignePromotion';
import { IPromotionRepository } from '../interfaces/IPromotionRepository';

export class PromotionRepository implements IPromotionRepository {
    async list() {
        return Promotion.findAll({
            include: [
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'is_service', 'price', 'priority', 'status'],
                    through: { attributes: [] },
                    required: false,
                },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async findById(id: string) {
        return Promotion.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'is_service', 'price', 'priority', 'status'],
                    through: { attributes: [] },
                    required: false,
                },
            ],
        });
    }

    async findByCode(code: string, excludeId?: string) {
        const where: {
            code: string;
            id?: { [Op.ne]: string };
        } = { code };

        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }

        return Promotion.findOne({ where });
    }

    async create(payload: PromotionCreationAttributes) {
        return Promotion.create(payload);
    }

    async update(promotion: Promotion, payload: Partial<PromotionCreationAttributes>) {
        await promotion.update(payload);
        return promotion;
    }

    async delete(promotion: Promotion) {
        await promotion.destroy();
    }

    async deleteProductLinks(promotionId: string) {
        await LignePromotion.destroy({ where: { promotion_id: promotionId } });
    }

    async replaceProductLinks(promotionId: string, productIds: string[]) {
        await this.deleteProductLinks(promotionId);

        if (productIds.length === 0) {
            return;
        }

        await LignePromotion.bulkCreate(
            productIds.map((productId) => ({
                product_id: productId,
                promotion_id: promotionId,
            })),
        );
    }

    async findExistingProductLinks(promotionId: string, productIds: string[]) {
        return LignePromotion.findAll({
            where: {
                promotion_id: promotionId,
                product_id: {
                    [Op.in]: productIds,
                },
            },
        });
    }

    async addProductLinks(promotionId: string, productIds: string[]) {
        if (productIds.length === 0) {
            return;
        }

        await LignePromotion.bulkCreate(
            productIds.map((productId) => ({
                product_id: productId,
                promotion_id: promotionId,
            })),
        );
    }

    async removeProductLink(promotionId: string, productId: string) {
        await LignePromotion.destroy({
            where: {
                promotion_id: promotionId,
                product_id: productId,
            },
        });
    }

}
