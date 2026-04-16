import { HttpError } from '../common/httpError';
import { CategoryFiltersDto } from '../dto/category';
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
}

