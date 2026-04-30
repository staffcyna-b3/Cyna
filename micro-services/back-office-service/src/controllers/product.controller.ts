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

export class ProductController {
    constructor(private readonly productService: IProductService) { }

    async list(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as ProductFiltersDto;

            const products = await this.productService.list(filters);

            return res.status(200).json(products);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur list products');
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const product = await this.productService.getById(productId);
            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur get product by id');
        }
    }

    async createSaas(req: Request, res: Response) {
        try {
            const payload = req.body as CreateProductDto;
            payload.is_service = true;

            const product = await this.productService.create(payload);

            return res.status(201).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur create SaaS');
        }
    }

    async createPhysical(req: Request, res: Response) {
        try {
            const payload = req.body as CreateProductDto;
            payload.is_service = false;

            const product = await this.productService.create(payload);

            return res.status(201).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur create physical product');
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const payload = req.body as UpdateProductDto;

            const product = await this.productService.update(productId, payload);

            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update product');
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const result = await this.productService.remove(productId);
            return res.status(200).json(result);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur delete product');
        }
    }

    async updateStock(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const payload = req.body as UpdateStockDto;

            const product = await this.productService.updateStock(productId, payload);

            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update stock');
        }
    }

    async getImage(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };

            const image = await this.productService.getImage(productId);
            return res.status(200).json(image);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur get product image');
        }
    }

    async updateImage(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const payload = req.body as UpdateProductImageDto;

            const image = await this.productService.updateImage(productId, payload);
            return res.status(200).json(image);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update product image');
        }
    }

    async setMaintenance(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const { maintenance } = req.body as { maintenance: boolean };
            const product = await this.productService.setMaintenance(productId, maintenance);
            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur maintenance product');
        }
    }

    async updatePriority(req: Request, res: Response) {
        try {
            const { id: productId } = req.params as { id: string };
            const { priority } = req.body as { priority: number };
            const product = await this.productService.updatePriority(productId, priority);
            return res.status(200).json(product);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur update priority');
        }
    }

    async reorderDisplayPriority(req: Request, res: Response) {
        try {
            const { items } = req.body as { items: ReorderDisplayPriorityItemDto[] };
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

