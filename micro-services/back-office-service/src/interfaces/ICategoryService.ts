import Category from '../models/Category';
import { CategoryFiltersDto, CategorySelectOptionDto, ReorderCategoryPriorityItemDto } from '../dto/category';

export interface ICategoryService {
    list(filters: CategoryFiltersDto): Promise<Category[]>;
    listForSelect(filters: CategoryFiltersDto): Promise<CategorySelectOptionDto[]>;
    getById(id: string): Promise<Category>;
    reorderDisplayPriority(items: ReorderCategoryPriorityItemDto[]): Promise<Category[]>;
}

