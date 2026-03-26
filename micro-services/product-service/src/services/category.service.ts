import CategoryRepository from '../repository/category.repository';
import Category from '../models/Category';
import { ListPromise } from '../types/ListPromise';

export default class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async listCategories(): Promise<ListPromise<Category>> {
        return await this.categoryRepository.listCategories();
    }
}