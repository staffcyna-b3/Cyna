import { Request, Response } from 'express';
import { Logger } from '../common/logger';
import { HttpError } from '../common/httpError';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/promotion';
import { IPromotionService } from '../interfaces/IPromotionService';
import { Schema } from '../schemas/schema.types';
import { validate } from '../schemas/validator';
import {
    createPromotionSchema,
    productIdParamSchema,
    promotionIdParamSchema,
    promotionProductIdsSchema,
    setActiveSchema,
    updatePromotionSchema,
} from '../schemas/promotion.schemas';

export class PromotionController {
    constructor(private readonly promotionService: IPromotionService) { }

    private parseWithSchema<T>(schema: Schema, data: Record<string, unknown>): T {
        const result = validate<T>(schema, data);

        if (!result.valid || !result.data) {
            throw new HttpError(400, result.errors.join(', '));
        }

        return result.data;
    }

    async list(req: Request, res: Response) {
        try {
            const promotions = await this.promotionService.list();
            return res.status(200).json(promotions);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur list promotions');
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const promotion = await this.promotionService.getById(promotionId);
            return res.status(200).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur get promotion by id');
        }
    }

    async create(req: Request, res: Response) {
        try {
            const payload = this.parseWithSchema<CreatePromotionDto>(
                createPromotionSchema,
                req.body as Record<string, unknown>,
            );

            const promotion = await this.promotionService.create(payload);

            return res.status(201).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur create promotion');
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const payload = this.parseWithSchema<UpdatePromotionDto>(
                updatePromotionSchema,
                req.body as Record<string, unknown>,
            );

            const promotion = await this.promotionService.update(promotionId, payload);

            return res.status(200).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update promotion');
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const result = await this.promotionService.remove(promotionId);
            return res.status(200).json(result);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur delete promotion');
        }
    }

    async setActive(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const { active } = this.parseWithSchema<{ active: boolean }>(
                setActiveSchema,
                req.body as Record<string, unknown>,
            );
            const promotion = await this.promotionService.setActive(promotionId, active);
            return res.status(200).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur set promotion active');
        }
    }

    async replaceProducts(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const { product_ids: productIds } = this.parseWithSchema<{ product_ids: string[] }>(
                promotionProductIdsSchema,
                req.body as Record<string, unknown>,
            );
            const promotion = await this.promotionService.replaceProducts(promotionId, productIds);
            return res.status(200).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur replace promotion products');
        }
    }

    async addProducts(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const { product_ids: productIds } = this.parseWithSchema<{ product_ids: string[] }>(
                promotionProductIdsSchema,
                req.body as Record<string, unknown>,
            );
            const promotion = await this.promotionService.addProducts(promotionId, productIds);
            return res.status(200).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur add promotion products');
        }
    }

    async removeProduct(req: Request, res: Response) {
        try {
            const { id: promotionId } = this.parseWithSchema<{ id: string }>(
                promotionIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const { productId } = this.parseWithSchema<{ productId: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const promotion = await this.promotionService.removeProduct(promotionId, productId);
            return res.status(200).json(promotion);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur remove promotion product');
        }
    }

    private handleError(res: Response, error: unknown, fallbackMessage: string) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        Logger.error(fallbackMessage, {
            message: error instanceof Error ? error.message : String(error),
        });

        return res.status(500).json({ message: 'Internal server error' });
    }
}

