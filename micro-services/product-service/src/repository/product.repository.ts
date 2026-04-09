import { WhereOptions, Op } from 'sequelize';
import Product from '../models/Product';
import { AbstractRepository } from './abstract.repository';
import { AppError } from '../common/errors';
import { ProductResponseDto } from '../dto/response/ProductResponse.dto';
import { ProductSuggestionDto } from '../dto/response/ProductSuggestion.dto';
import { mapProductToDto } from '../utils/mapProductToDto';
import { ProductListOptionsDto } from '../dto/requests/ProductListOptions.dto';
import { ProductListResponseDto } from '../dto/response/ProductListResponse.dto';
import { sequelize } from '../config/database';

export default class ProductRepository extends AbstractRepository<Product> {
    constructor() {
        super(Product);
        this.defaultIncludes = [
            {
                association: 'images',
                attributes: ['id', 'image', 'product_id', 'alt_text', 'is_main'],
                required: false,
            },
            {
                association: 'category',
                attributes: ['id', 'name', 'description', 'type'],
                required: false,
            },
        ];
    }

    async listProducts(options: ProductListOptionsDto): Promise<ProductListResponseDto> {
        const safePage = Number.isInteger(options?.page) && (options?.page as number) > 0 ? (options.page as number) : 1;
        const safeLimit = Number.isInteger(options?.limit) && (options?.limit as number) > 0 ? Math.min(options.limit as number, 100) : 10;
        const where = (options?.where ?? (options?.filters as unknown as WhereOptions<Product>)) as WhereOptions<Product> | undefined;

        const { rows, count, page, totalPages } = await this.list({
            page: safePage,
            limit: safeLimit,
            where,
            order: options.order,
            include: this.defaultIncludes,
        });

        return {
            rows: rows.map((product) => mapProductToDto(product)),
            count,
            page,
            limit: safeLimit,
            totalPages,
        };
    }

    async getProductById(id: string): Promise<ProductResponseDto | null> {
        try {
            const product = await this.getById(id, this.defaultIncludes);
            if (!product) {
                return null;
            }

            return mapProductToDto(product);
        } catch (error) {
            if (error instanceof AppError && (error as any).statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async countProducts(where?: WhereOptions<Product>): Promise<number> {
        return await this.count(where);
    }

    async getSimilarProducts(productId: string): Promise<ProductResponseDto[] | null> {
        try {
            const product = await this.model.findByPk(productId as any);
            if (!product) {
                return null;
            }

            const similarProducts = await this.model.findAll({
                where: {
                    category_id: (product as any).category_id,
                    id: { [Op.ne]: productId },
                },
                include: this.defaultIncludes,
                limit: 10,
            });

            return similarProducts.map((p: any) => mapProductToDto(p));
        } catch (error) {
            if (error instanceof AppError && (error as any).statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async getProductSuggestions(search: string): Promise<ProductSuggestionDto[]> {
        const likeOperator = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
        const products = await this.model.findAll({
            attributes: ['id', 'name'],
            where: {
                name: {
                    [likeOperator]: `%${search}%`,
                },
            },
            order: [['name', 'ASC']],
            limit: 8,
        });

        return products.map((product) => ({
            id: product.id,
            name: product.name,
        }));
    }
}
