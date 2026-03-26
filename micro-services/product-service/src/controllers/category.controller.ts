import { Request, Response } from 'express';
import { Logger } from '../common/logger';
import { ErrorResponse } from '../types/ErrorResponse';
import { SuccessResponse } from '../types/SuccessResponse';
import CategoryService from '../services/category.service';

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    async listCategories(req: Request, res: Response): Promise<Response> {
        try {
            Logger.info('Récupération de toutes les catégories');
            const categories = await this.categoryService.listCategories();
            return res.status(200).json(new SuccessResponse('Catégories récupérées avec succès', categories));
        }
        catch (error: any) {
            Logger.error('Erreur listCategories', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }
}
