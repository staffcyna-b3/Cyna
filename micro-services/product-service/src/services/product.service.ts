import { Op, WhereOptions } from 'sequelize';
import { ValidationError, NotFoundError } from '../common/errors';
import { Logger } from '../common/logger';
import { ProductResponseDto } from '../dto/response/ProductResponse.dto';
import { ProductListResponseDto } from '../dto/response/ProductListResponse.dto';
import { ProductListFilterDto } from '../dto/requests/ProductListFilter.dto';
import { ProductListOptionsDto } from '../dto/requests/ProductListOptions.dto';
import { ProductSuggestionDto } from '../dto/response/ProductSuggestion.dto';
import { SortOrder } from '../enum/SortOrder.enum';
import Product from '../models/Product';
import { sequelize } from '../config/database';
import ProductRepository from '../repositories/product.repository';

export default class ProductService {
    constructor(private readonly productRepository: ProductRepository) {}

    async listProducts(options?: ProductListOptionsDto): Promise<ProductListResponseDto> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 10;

        this.validatePagination(page, limit);

        const where = this.buildWhereClause(options?.filters);
        const order = options?.filters?.sortBy ? [[options.filters.sortBy, (options.filters.sortOrder || SortOrder.ASC).toUpperCase()]] : undefined;

        try {
            return await this.productRepository.listProducts({
                page,
                limit,
                where,
                order,
            });
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }

            Logger.error('Erreur lors de la recuperation de la liste des produits', {
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
            if (!product) {
                throw new NotFoundError(`Produit avec l'ID ${id} non trouve`, { context: { id } });
            }

            return product;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            Logger.error('Erreur lors de la recuperation du produit', {
                id,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async getProductBySlug(slug: string): Promise<ProductResponseDto> {
        if (!slug || typeof slug !== 'string') {
            throw new ValidationError('Slug produit invalide', {
                context: { providedSlug: slug },
            });
        }

        try {
            const product = await this.productRepository.getProductBySlug(slug);
            if (!product) {
                throw new NotFoundError(`Produit avec le slug '${slug}' non trouve`, { context: { slug } });
            }

            return product;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            Logger.error('Erreur lors de la recuperation du produit par slug', {
                slug,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async countProducts(filters?: ProductListFilterDto): Promise<number> {
        const where = this.buildWhereClause(filters);
        try {
            return await this.productRepository.countProducts(where);
        } catch (error) {
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
            if (!products) {
                throw new NotFoundError(`Produit avec l'ID ${productId} non trouve`, { context: { id: productId } });
            }
            return products;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            Logger.error('Erreur lors de la recuperation des produits similaires', {
                id: productId,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async handleTransaction(items: { productId: string; quantity: number }[], status: string): Promise<void> {
        if (status !== 'succeeded' || items.length === 0) return;
        await this.productRepository.decrementStockForPhysicalProducts(items);
        Logger.info('Stock decremented after successful payment', { itemCount: items.length });
    }

    async getProductSuggestions(search: string): Promise<ProductSuggestionDto[]> {
        this.validateSearch(search);

        try {
            return await this.productRepository.getProductSuggestions(search.trim());
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }

            Logger.error('Erreur lors de la recuperation des suggestions produits', {
                search,
                originalError: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    private validatePagination(page: number, limit: number): void {
        if (!Number.isInteger(page) || page < 1) {
            throw new ValidationError('Page doit etre un entier superieur a 0', {
                context: { page },
            });
        }

        if (!Number.isInteger(limit) || limit < 1) {
            throw new ValidationError('Limit doit etre un entier superieur a 0', {
                context: { limit },
            });
        }

        if (limit > 100) {
            throw new ValidationError('Limit ne peut pas depasser 100', {
                context: { limit },
            });
        }
    }

    private buildWhereClause(filters?: ProductListFilterDto): WhereOptions<Product> {
        const where: WhereOptions<Product> & { [Op.or]?: unknown[] } = {};

        if (filters?.categoryId) {
            this.validateCategoryId(filters.categoryId);
            where.category_id = filters.categoryId;
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            this.validatePriceRange(filters?.minPrice, filters?.maxPrice);
            where.price = {};

            if (filters?.minPrice !== undefined) {
                (where.price as Record<symbol, number>)[Op.gte] = filters.minPrice;
            }

            if (filters?.maxPrice !== undefined) {
                (where.price as Record<symbol, number>)[Op.lte] = filters.maxPrice;
            }
        }

        if (filters?.isService !== undefined) {
            where.is_service = Boolean(filters.isService);
        }

        if (filters?.inStock !== undefined) {
            where.stock = filters.inStock ? { [Op.gt]: 0 } : { [Op.eq]: 0 };
        }

        if (filters?.search) {
            this.validateSearch(filters.search);
            const ilikeOp = sequelize && sequelize.getDialect && sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
            where[Op.or] = [
                { name: { [ilikeOp]: `%${filters.search}%` } },
                { description: { [ilikeOp]: `%${filters.search}%` } },
            ];
        }

        return where;
    }

    private validateCategoryId(categoryId: string): void {
        if (typeof categoryId !== 'string' || categoryId.trim().length === 0) {
            throw new ValidationError('categoryId doit etre une chaine non vide', {
                context: { categoryId },
            });
        }
    }

    private validatePriceRange(minPrice?: number, maxPrice?: number): void {
        if (minPrice !== undefined) {
            if (typeof minPrice !== 'number' || minPrice < 0) {
                throw new ValidationError('minPrice doit etre un nombre positif', {
                    context: { minPrice },
                });
            }
        }

        if (maxPrice !== undefined) {
            if (typeof maxPrice !== 'number' || maxPrice < 0) {
                throw new ValidationError('maxPrice doit etre un nombre positif', {
                    context: { maxPrice },
                });
            }
        }

        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            throw new ValidationError('minPrice ne peut pas etre superieur a maxPrice', {
                context: { minPrice, maxPrice },
            });
        }
    }

    private validateSearch(search: string): void {
        if (typeof search !== 'string' || search.trim().length < 2) {
            throw new ValidationError('La recherche doit contenir au moins 2 caracteres', {
                context: { search },
            });
        }

        if (search.length > 255) {
            throw new ValidationError('La recherche ne peut pas depasser 255 caracteres', {
                context: { search },
            });
        }
    }
}
