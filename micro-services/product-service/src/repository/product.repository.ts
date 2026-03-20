import { WhereOptions } from 'sequelize';
import Product from '../models/Product';
import ProductImage from '../models/ProductImage';
import { AbstractRepository } from './abstract.repository';
import { AppError } from '../common/errors';
import { ProductResponseDto } from '../dto/response/ProductResponse.dto';
import { mapProductToDto } from '../utils/mapProductToDto';
import { ProductListOptionsDto } from '../dto/requests/ProductListOptions.dto';
import { ProductListResponseDto } from '../dto/response/ProductListResponse.dto';

import { SortOrder } from '../enum/Sortrder.enum';

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
                attributes: ['id', 'name', 'type'],
                required: false,
            },
        ];
    }

    async listProducts(options: ProductListOptionsDto): Promise<ProductListResponseDto> {
        const { rows, count, page, totalPages } = await this.list({
            page: options.page,
            limit: options.limit,
            where: (options.where ?? (options.filters as unknown as WhereOptions<Product>)) as WhereOptions<Product> | undefined,
            order: options.order,
            include: this.defaultIncludes,
        });

        return {
            rows: rows.map((product) => mapProductToDto(product)),
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

                return mapProductToDto(product);
            } catch (error) {
                if (error instanceof AppError && (error as any).statusCode === 404) 
                    return null;
                throw error;
            }
    }

    async countProducts(where?: WhereOptions<Product>): Promise<number> {
        return await this.count(where);
    }
}
