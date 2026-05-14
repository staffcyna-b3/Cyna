import { Op } from 'sequelize';
import Category from '../models/Category';
import { CategoryFiltersDto, CategorySelectOptionDto, ReorderCategoryPriorityItemDto } from '../dto/category';
import { ICategoryRepository } from '../interfaces/ICategoryRepository';

export class CategoryRepository implements ICategoryRepository {
    async list(filters: CategoryFiltersDto): Promise<Category[]> {
        const where: {
            type?: string;
            [Op.or]?: Array<Record<string, unknown>>;
        } = {};

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.search && filters.search.trim().length > 0) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filters.search.trim()}%` } },
                { description: { [Op.like]: `%${filters.search.trim()}%` } },
            ];
        }

        return Category.findAll({
            where,
            order: [
                ['priority', 'DESC'],
                ['name', 'ASC'],
            ],
        });
    }

    async listForSelect(filters: CategoryFiltersDto): Promise<CategorySelectOptionDto[]> {
        const where: {
            type?: string;
            [Op.or]?: Array<Record<string, unknown>>;
        } = {};

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.search && filters.search.trim().length > 0) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filters.search.trim()}%` } },
            ];
        }

        const categories = await Category.findAll({
            attributes: ['id', 'name', 'type'],
            where,
            order: [
                ['priority', 'DESC'],
                ['name', 'ASC'],
            ],
        });

        return categories.map((category) => ({
            id: category.id,
            name: category.name,
            type: category.type,
        }));
    }

    async findById(id: string): Promise<Category | null> {
        return Category.findByPk(id);
    }

    async reorderDisplayPriority(items: ReorderCategoryPriorityItemDto[]): Promise<Category[]> {
        for (const item of items) {
            const category = await Category.findByPk(item.id);
            if (!category) {
                throw new Error(`CATEGORY_NOT_FOUND:${item.id}`);
            }

            await category.update({ priority: item.priority });
        }

        return Category.findAll({
            order: [
                ['priority', 'DESC'],
                ['name', 'ASC'],
            ],
        });
    }
}

