import { Request, Response } from 'express';
import { Logger } from '../common/logger';
import { HttpError } from '../common/httpError';
import { IProductService } from '../interfaces/IProductService';
import {
    CreateProductDto,
    ProductFiltersDto,
    ReorderDisplayPriorityItemDto,
    UpdateProductImageDto,
    UpdateProductDto,
    UpdateStockDto,
} from '../dto/product';
import { Schema } from '../schemas/schema.types';
import { validate } from '../schemas/validator';
import {
    createPhysicalSchema,
    createSaasSchema,
    maintenanceSchema,
    prioritySchema,
    productIdParamSchema,
    productListQuerySchema,
    reorderDisplayPrioritySchema,
    updateProductImageSchema,
    updateProductSchema,
    updateStockSchema,
} from '../schemas/product.schemas';

export class ProductController {
    constructor(private readonly productService: IProductService) { }

    private parseWithSchema<T>(schema: Schema, data: Record<string, unknown>): T {
        const result = validate<T>(schema, data);

        if (!result.valid || !result.data) {
            throw new HttpError(400, result.errors.join(', '));
        }

        return result.data;
    }

    async list(req: Request, res: Response) {
        try {
            const filters = this.parseWithSchema<ProductFiltersDto>(
                productListQuerySchema,
                req.query as unknown as Record<string, unknown>,
            );

            const products = await this.productService.list(filters);

            return res.status(200).json(products);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur list products');
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const product = await this.productService.getById(productId);
            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur get product by id');
        }
    }

    async createSaas(req: Request, res: Response) {
        try {
            const payload = this.parseWithSchema<CreateProductDto>(
                createSaasSchema,
                req.body as Record<string, unknown>,
            );
            payload.is_service = true;

            const product = await this.productService.create(payload);

            return res.status(201).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur create SaaS');
        }
    }

    async createPhysical(req: Request, res: Response) {
        try {
            const payload = this.parseWithSchema<CreateProductDto>(
                createPhysicalSchema,
                req.body as Record<string, unknown>,
            );
            payload.is_service = false;

            const product = await this.productService.create(payload);

            return res.status(201).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur create physical product');
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const payload = this.parseWithSchema<UpdateProductDto>(
                updateProductSchema,
                req.body as Record<string, unknown>,
            );

            const product = await this.productService.update(productId, payload);

            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update product');
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const result = await this.productService.remove(productId);
            return res.status(200).json(result);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur delete product');
        }
    }

    async updateStock(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const payload = this.parseWithSchema<UpdateStockDto>(
                updateStockSchema,
                req.body as Record<string, unknown>,
            );

            const product = await this.productService.updateStock(productId, payload);

            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update stock');
        }
    }

    async getImage(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );

            const image = await this.productService.getImage(productId);
            return res.status(200).json(image);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur get product image');
        }
    }

    async updateImage(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const payload = this.parseWithSchema<UpdateProductImageDto>(
                updateProductImageSchema,
                req.body as Record<string, unknown>,
            );

            const image = await this.productService.updateImage(productId, payload);
            return res.status(200).json(image);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update product image');
        }
    }

    async setMaintenance(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const { maintenance } = this.parseWithSchema<{ maintenance: boolean }>(
                maintenanceSchema,
                req.body as Record<string, unknown>,
            );
            const product = await this.productService.setMaintenance(productId, maintenance);
            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur maintenance product');
        }
    }

    async updatePriority(req: Request, res: Response) {
        try {
            const { id: productId } = this.parseWithSchema<{ id: string }>(
                productIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const { priority } = this.parseWithSchema<{ priority: number }>(
                prioritySchema,
                req.body as Record<string, unknown>,
            );
            const product = await this.productService.updatePriority(productId, priority);
            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update priority');
        }
    }

    async reorderDisplayPriority(req: Request, res: Response) {
        try {
            const { items } = this.parseWithSchema<{ items: ReorderDisplayPriorityItemDto[] }>(
                reorderDisplayPrioritySchema,
                req.body as Record<string, unknown>,
            );
            const products = await this.productService.reorderDisplayPriority(items);
            return res.status(200).json(products);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur reorder display priority');
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

