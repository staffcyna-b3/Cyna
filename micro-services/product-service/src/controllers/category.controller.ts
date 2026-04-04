import { Request, Response } from 'express';
import { Logger } from '../common/logger';
import { ErrorResponse } from '../types/ErrorResponse';
import { SuccessResponse } from '../types/SuccessResponse';
import CategoryService from '../services/category.service';

export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    async listCategories(req: Request, res: Response): Promise<Response> {
        try {
            Logger.info('Recuperation de toutes les categories');
            const categories = await this.categoryService.listCategories();
            return res.status(200).json(new SuccessResponse('Categories recuperees avec succes', categories));
        } catch (error: any) {
            Logger.error('Erreur listCategories', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }
}
