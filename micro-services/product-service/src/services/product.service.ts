import { Op, WhereOptions } from 'sequelize';
import { ValidationError, NotFoundError } from '../common/errors';
import { Logger } from '../common/logger';
import { ProductResponseDto } from '../dto/response/ProductResponse.dto';
import { ProductListResponseDto } from '../dto/response/ProductListResponse.dto';
import { ProductListFilterDto } from '../dto/requests/ProductListFilter.dto';
import { ProductListOptionsDto } from '../dto/requests/ProductListOptions.dto';
import { SortOrder } from '../enum/Sortrder.enum';
import Product from '../models/Product';
import { sequelize } from '../config/database';
import ProductRepository from '../repository/product.repository';

export default class ProductService {
    private productRepository: ProductRepository;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    async listProducts(options?: ProductListOptionsDto): Promise<ProductListResponseDto> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 10;

        this.validatePagination(page, limit);

        const where = this.buildWhereClause(options?.filters);
        const order = options?.filters?.sortBy ? [[options.filters.sortBy, options.filters.sortOrder || SortOrder.ASC]] : undefined;

        try {
            return await this.productRepository.listProducts({
                page,
                limit,
                where,
                order,
            });
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError)
                throw error;

            Logger.error('Erreur lors de la récupération de la liste des produits', {
                page,
                limit,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async getProductById(id: string): Promise<ProductResponseDto> {
        if (!id || typeof id !== 'string') {
            throw new ValidationError('ID produit invalide', {
                context: { providedId: id },
            });
        }

        try {
            const product = await this.productRepository.getProductById(id);
            if (!product) 
                throw new NotFoundError(`Produit avec l'ID ${id} non trouvé`, { context: { id } });
            
            return product;
        }
        catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
            Logger.error('Erreur lors de la récupération du produit', {
                id,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async countProducts(filters?: ProductListFilterDto): Promise<number> {
        const where = this.buildWhereClause(filters);
        try {
            return await this.productRepository.countProducts(where);
        } 
        catch (error) {
            Logger.error('Erreur lors du comptage des produits', {
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async getSimilarProducts(productId: string): Promise<ProductResponseDto[]> {
        if (!productId || typeof productId !== 'string') {
            throw new ValidationError('ID produit invalide', {
                context: { providedId: productId },
            });
        }

        try {
            const products = await this.productRepository.getSimilarProducts(productId);
            if (!products)
                throw new NotFoundError(`Produit avec l'ID ${productId} non trouvé`, { context: { id: productId } });
            return products;
        }
        catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
            Logger.error('Erreur lors de la récupération des produits similaires', {
                id: productId,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    private validatePagination(page: number, limit: number): void {
        if (!Number.isInteger(page) || page < 1) {
            throw new ValidationError('Page doit être un entier supérieur à 0', {
                context: { page },
            });
        }

        if (!Number.isInteger(limit) || limit < 1) {
            throw new ValidationError('Limit doit être un entier supérieur à 0', {
                context: { limit },
            });
        }

        if (limit > 100) {
            throw new ValidationError('Limit ne peut pas dépasser 100', {
                context: { limit },
            });
        }
    }


    private buildWhereClause(filters?: ProductListFilterDto): WhereOptions<Product> {
        const where: WhereOptions<Product> & { [Op.or]?: any[] } = {};

        if (filters?.categoryId) {
            this.validateCategoryId(filters.categoryId);
            where.category_id = filters.categoryId;
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            this.validatePriceRange(filters?.minPrice, filters?.maxPrice);
            where.price = {};
            
            if (filters?.minPrice !== undefined)
                (where.price as any)[Op.gte] = filters.minPrice;

            if (filters?.maxPrice !== undefined)
                (where.price as any)[Op.lte] = filters.maxPrice;
        }

        if (filters?.isService !== undefined)
            where.is_service = Boolean(filters.isService);
        

        if (filters?.inStock !== undefined)
            where.stock = filters.inStock ? { [Op.gt]: 0 } : { [Op.eq]: 0 };

        if (filters?.search) {
            this.validateSearch(filters.search);
            const ilikeOp = (sequelize && sequelize.getDialect && sequelize.getDialect() === 'postgres') ? Op.iLike : Op.like;
            where[Op.or] = [
                { name: { [ilikeOp]: `%${filters.search}%` } },
                { description: { [ilikeOp]: `%${filters.search}%` } },
            ];
        }

        return where;
    }


    private validateCategoryId(categoryId: string): void {
        if (typeof categoryId !== 'string' || categoryId.trim().length === 0) {
            throw new ValidationError('categoryId doit être une chaîne non vide', {
                context: { categoryId },
            });
        }
    }


    private validatePriceRange(
        minPrice?: number,
        maxPrice?: number
    ): void {
        if (minPrice !== undefined) {
        if (typeof minPrice !== 'number' || minPrice < 0) {
            throw new ValidationError('minPrice doit être un nombre positif', { 
                context: { minPrice },
            });
        }
        }

        if (maxPrice !== undefined) {
        if (typeof maxPrice !== 'number' || maxPrice < 0) {
            throw new ValidationError('maxPrice doit être un nombre positif', {
                context: { maxPrice },
            });
        }
        }

        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            throw new ValidationError(
                'minPrice ne peut pas être supérieur à maxPrice',
                {context: { minPrice, maxPrice },}
            );
        }
    }

    private validateSearch(search: string): void {
        if (typeof search !== 'string' || search.trim().length < 2) {
            throw new ValidationError(
                'La recherche doit contenir au moins 2 caractères',
                {context: { search },}
            );
        }

        if (search.length > 255) {
            throw new ValidationError(
                'La recherche ne peut pas dépasser 255 caractères',
                {context: { search },}
            );
        }
    }
}
