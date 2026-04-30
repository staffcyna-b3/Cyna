import Category from '../models/Category';
import { CategoryFiltersDto, CategorySelectOptionDto, ReorderCategoryPriorityItemDto } from '../dto/category';

export interface ICategoryRepository {
    list(filters: CategoryFiltersDto): Promise<Category[]>;
    listForSelect(filters: CategoryFiltersDto): Promise<CategorySelectOptionDto[]>;
    findById(id: string): Promise<Category | null>;
    reorderDisplayPriority(items: ReorderCategoryPriorityItemDto[]): Promise<Category[]>;
}

