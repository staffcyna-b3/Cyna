import { Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { ICategoryService } from '../interfaces/ICategoryService';
import { CategoryFiltersDto } from '../dto/category';
import { Schema } from '../schemas/schema.types';
import { validate } from '../schemas/validator';
import { categoryFiltersQuerySchema, categoryIdParamSchema } from '../schemas/category.schemas';

export class CategoryController {
    constructor(private readonly categoryService: ICategoryService) { }

    private parseWithSchema<T>(schema: Schema, data: Record<string, unknown>): T {
        const result = validate<T>(schema, data);

        if (!result.valid || !result.data) {
            throw new HttpError(400, result.errors.join(', '));
        }

        return result.data;
    }

    async list(req: Request, res: Response) {
        try {
            const filters = this.parseWithSchema<CategoryFiltersDto>(
                categoryFiltersQuerySchema,
                req.query as unknown as Record<string, unknown>,
            );
            const categories = await this.categoryService.list(filters);
            return res.status(200).json(categories);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur list categories');
        }
    }

    async listForSelect(req: Request, res: Response) {
        try {
            const filters = this.parseWithSchema<CategoryFiltersDto>(
                categoryFiltersQuerySchema,
                req.query as unknown as Record<string, unknown>,
            );
            const categories = await this.categoryService.listForSelect(filters);
            return res.status(200).json(categories);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur list categories for select');
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id: categoryId } = this.parseWithSchema<{ id: string }>(
                categoryIdParamSchema,
                req.params as unknown as Record<string, unknown>,
            );
            const category = await this.categoryService.getById(categoryId);
            return res.status(200).json(category);
        } catch (error: unknown) {
            return this.handleError(res, error, 'Erreur get category by id');
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

