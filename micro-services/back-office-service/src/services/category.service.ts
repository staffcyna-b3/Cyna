import { HttpError } from '../common/httpError';
import { CategoryFiltersDto, ReorderCategoryPriorityItemDto } from '../dto/category';
import { CategoryType } from '../enum/CategoryType';
import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { ICategoryService } from '../interfaces/ICategoryService';

export class CategoryService implements ICategoryService {
    constructor(private readonly categoryRepository: ICategoryRepository) { }

    async list(filters: CategoryFiltersDto) {
        return this.categoryRepository.list(filters);
    }

    async listForSelect(filters: CategoryFiltersDto) {
        return this.categoryRepository.listForSelect(filters);
    }

    async getById(id: string) {
        const category = await this.categoryRepository.findById(id);

        if (!category) {
            throw new HttpError(404, 'Categorie introuvable');
        }

        return category;
    }

    async reorderDisplayPriority(items: ReorderCategoryPriorityItemDto[]) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new HttpError(400, 'La liste de priorites est obligatoire');
        }

        const invalidItem = items.find((item) => !item?.id || !Number.isInteger(item.priority) || item.priority < 0);
        if (invalidItem) {
            throw new HttpError(400, 'Chaque element doit contenir id et priority valide');
        }

        for (const item of items) {
            const category = await this.categoryRepository.findById(item.id);
            if (!category) {
                throw new HttpError(404, `Categorie introuvable: ${item.id}`);
            }

            if (category.type !== CategoryType.SERVICE) {
                throw new HttpError(400, 'Seules les categories de type service peuvent etre reordonnees ici');
            }
        }

        try {
            const categories = await this.categoryRepository.reorderDisplayPriority(items);
            return categories.filter((category) => category.type === CategoryType.SERVICE);
        } catch (error: unknown) {
            if (error instanceof Error && error.message.startsWith('CATEGORY_NOT_FOUND:')) {
                const categoryId = error.message.replace('CATEGORY_NOT_FOUND:', '');
                throw new HttpError(404, `Categorie introuvable: ${categoryId}`);
            }

            throw error;
        }
    }
}

