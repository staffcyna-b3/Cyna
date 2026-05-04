import { Request, Response } from 'express';
import ProductService from '../services/product.service';
import { Logger } from '../common/logger';
import { ErrorResponse } from '../types/ErrorResponse';
import { SuccessResponse } from '../types/SuccessResponse';
import { SortOrder } from '../enum/Sortrder.enum';
import { SortBy } from '../enum/SortBy.enum';

export class ProductController {
    constructor(private readonly productService: ProductService) {}

    async listProducts(req: Request, res: Response): Promise<Response> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            Logger.info('Recuperation de la liste des produits', {
                page,
                limit,
                filters: req.query,
            });

            const result = await this.productService.listProducts({
                page,
                limit,
                filters: {
                    categoryId: req.query.categoryId as string,
                    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                    search: req.query.search as string,
                    isService: req.query.isService !== undefined ? req.query.isService === 'true' : undefined,
                    inStock: req.query.inStock !== undefined ? req.query.inStock === 'true' : undefined,
                    sortBy: req.query.sortBy as SortBy,
                    sortOrder: req.query.sortOrder as SortOrder,
                },
            });

            return res.status(200).json(new SuccessResponse('Liste des produits recuperee avec succes', result));
        } catch (error: any) {
            Logger.error('Erreur listProducts', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }

    async getProductById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params as { id: string };

            Logger.info("Recuperation d'un produit", { id });

            const product = await this.productService.getProductById(id);

            return res.status(200).json(new SuccessResponse('Produit recupere avec succes', product));
        } catch (error: any) {
            Logger.error('Erreur getProductById', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }

    async countProducts(req: Request, res: Response): Promise<Response> {
        try {
            Logger.info('Comptage des produits', { filters: req.query });

            const count = await this.productService.countProducts({
                categoryId: req.query.categoryId as string,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                search: req.query.search as string,
                isService: req.query.isService !== undefined ? req.query.isService === 'true' : undefined,
                inStock: req.query.inStock !== undefined ? req.query.inStock === 'true' : undefined,
            });

            return res.status(200).json(new SuccessResponse('Comptage des produits reussi', { count }));
        } catch (error: any) {
            Logger.error('Erreur countProducts', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }

    async getSimilarProducts(req: Request, res: Response): Promise<Response> {
        try {
            const productId = req.params.id as string;
            Logger.info('Recuperation des produits similaires au produit', { id: productId });
            const products = await this.productService.getSimilarProducts(productId);
            return res.status(200).json(new SuccessResponse('Produits similaires recuperes avec succes', products));
        } catch (error: any) {
            Logger.error('Erreur getSimilarProducts', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }

    async handleTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const { status, items } = req.body as {
                status: string;
                items?: { product_id: string; quantity: number }[];
            };
            const normalized = (items ?? []).map((i) => ({ productId: i.product_id, quantity: i.quantity }));
            await this.productService.handleTransaction(normalized, status);
            return res.status(200).json(new SuccessResponse('Transaction handled', null));
        } catch (error: any) {
            Logger.error('Erreur handleTransaction', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }

    async getProductSuggestions(req: Request, res: Response): Promise<Response> {
        try {
            const search = String(req.query.search ?? '');
            Logger.info('Recuperation des suggestions produits', { search });
            const suggestions = await this.productService.getProductSuggestions(search);
            return res.status(200).json(new SuccessResponse('Suggestions produits recuperees avec succes', suggestions));
        } catch (error: any) {
            Logger.error('Erreur getProductSuggestions', error);
            return res.status(500).json(new ErrorResponse(error.message || 'Erreur serveur'));
        }
    }
}
