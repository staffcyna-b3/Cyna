import { Op, Includeable, WhereOptions } from 'sequelize';
import Product from '../models/Product';
import ProductImage from '../models/ProductImage';
import { AbstractRepository } from './abstract.repository';
import { AppError } from '../common/errors';
import { ProductResponseDto } from '../dto/response/ProductResponse.dto';
import { ProductListOptionsDto } from '../dto/requests/ProductListOptions.dto';
import { ProductListResponseDto } from '../dto/response/ProductListResponse.dto';
import { ProductListFilterDto } from '../dto/requests/ProductListFilter.dto';

import { SortOrder } from '../enum/Sortrder.enum';

export default class ProductRepository extends AbstractRepository<Product> {
    constructor() {
        super(Product);
        this.defaultIncludes = [
            {
                association: 'images',
                attributes: ['id', 'product_id', 'alt_text', 'is_main'],
                required: false,
            },
            {
                association: 'category',
                attributes: ['id', 'name', 'type'],
                required: false,
            },
        ];
    }

    async listProducts(options: ProductListOptionsDto): Promise<ProductListResponseDto> {
        const { rows, count, page, totalPages } = await this.list({
            page: options.page,
            limit: options.limit,
            where: options.filters as unknown as WhereOptions<Product>,
            order: options.filters?.sortBy ? [[options.filters.sortBy, SortOrder.ASC]] : undefined,
            include: this.defaultIncludes,
        });

        return {
            rows: rows.map((product) => this.mapProductToDto(product)),
            count,
            page,
            limit: options.limit || 10,
            totalPages,
        };
    }

    async getProductById(id: string): Promise<ProductResponseDto | null> {
            try {
                const product = await this.getById(id, this.defaultIncludes);
                if (!product) 
                    return null;

                return this.mapProductToDto(product);
            } catch (error) {
                if (error instanceof AppError && (error as any).statusCode === 404) 
                    return null;
                throw error;
            }
    }

    async countProducts(where?: WhereOptions<Product>): Promise<number> {
        return await this.count(where);
    }


    private mapProductToDto(product: Product): ProductResponseDto {
        return {
            id: product.id,
            categoryId: product.category_id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            stock: product.stock,
            status: product.status,
            isService: product.is_service,
            duration: product.duration,
            priority: product.priority,
            images: (product as any).images?.map((img: ProductImage) => ({
                id: img.id,
                productId: img.product_id,
                altText: img.alt_text,
                isMain: img.is_main,
            })),
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        };
    }
}
