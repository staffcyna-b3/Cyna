import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { slugify } from '../utils/slugify';
import Product, { ProductCreationAttributes } from '../models/Product';
import Category from '../models/Category';
import ProductImage from '../models/ProductImage';
import { ProductFiltersDto, ReorderDisplayPriorityItemDto } from '../dto/product';
import { IProductRepository } from '../interfaces/IProductRepository';

export class ProductRepository implements IProductRepository {
    async list(filters: ProductFiltersDto) {
        const where: {
            [key: string]: unknown;
            [Op.or]?: Array<Record<string, unknown>>;
        } = {};

        if (typeof filters.is_service === 'boolean') {
            where.is_service = filters.is_service;
        }

        if (filters.category_id) {
            where.category_id = filters.category_id;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.search && filters.search.trim().length > 0) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filters.search.trim()}%` } },
                { description: { [Op.like]: `%${filters.search.trim()}%` } },
            ];
        }

        return Product.findAll({
            where,
            include: [
                {
                    association: 'category',
                    attributes: ['id', 'name', 'type'],
                },
            ],
            order: [
                ['priority', 'DESC'],
                ['updated_at', 'DESC'],
            ],
        });
    }

    async findById(id: string) {
        return Product.findByPk(id, {
            include: [
                {
                    association: 'category',
                    attributes: ['id', 'name', 'type'],
                },
            ],
        });
    }

    async create(payload: ProductCreationAttributes) {
        return Product.create(payload);
    }

    async update(product: Product, payload: Partial<ProductCreationAttributes>) {
        await product.update(payload);
        return product;
    }

    async delete(product: Product) {
        await product.destroy();
    }

    async findCategoryById(categoryId: string) {
        return Category.findByPk(categoryId);
    }

    async findMainImage(productId: string) {
        const mainImage = await ProductImage.findOne({
            where: {
                product_id: productId,
                is_main: true,
            },
        });

        if (mainImage) {
            return mainImage;
        }

        return ProductImage.findOne({
            where: {
                product_id: productId,
            },
            order: [['id', 'DESC']],
        });
    }

    async upsertMainImage(productId: string, image: Buffer, altText?: string | null) {
        await ProductImage.update(
            { is_main: false },
            {
                where: {
                    product_id: productId,
                },
            },
        );

        const existing = await this.findMainImage(productId);

        if (existing) {
            await existing.update({
                image,
                alt_text: altText ?? null,
                is_main: true,
            });
            return;
        }

        await ProductImage.create({
            product_id: productId,
            image,
            alt_text: altText ?? null,
            is_main: true,
        });
    }

    async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
        const base = slugify(name);
        const candidate = base;
        const exists = await Product.findOne({
            where: excludeId
                ? { slug: candidate, id: { [Op.ne]: excludeId } }
                : { slug: candidate },
            attributes: ['id'],
        });
        if (!exists) return candidate;

        const similar = await Product.findAll({
            where: excludeId
                ? { slug: { [Op.like]: `${base}-%` }, id: { [Op.ne]: excludeId } }
                : { slug: { [Op.like]: `${base}-%` } },
            attributes: ['slug'],
        });
        const usedSuffixes = new Set(
            similar
                .map((p) => {
                    const suffix = (p.slug ?? '').slice(base.length + 1);
                    return parseInt(suffix, 10);
                })
                .filter((n) => !Number.isNaN(n))
        );
        let counter = 2;
        while (usedSuffixes.has(counter)) counter++;
        return `${base}-${counter}`;
    }

    async reorderDisplayPriority(items: ReorderDisplayPriorityItemDto[]) {
        await sequelize.transaction(async (transaction: Transaction) => {
            for (const item of items) {
                const product = await Product.findByPk(item.id, { transaction });
                if (!product) {
                    throw new Error(`PRODUCT_NOT_FOUND:${item.id}`);
                }

                await product.update({ priority: item.priority }, { transaction });
            }
        });

        return Product.findAll({
            order: [
                ['priority', 'DESC'],
                ['updated_at', 'DESC'],
            ],
        });
    }

    async findProductsByIds(productIds: string[]) {
        return Product.findAll({
            where: {
                id: {
                    [Op.in]: productIds,
                },
            },
            attributes: ['id', 'is_service'],
        });
    }
}

