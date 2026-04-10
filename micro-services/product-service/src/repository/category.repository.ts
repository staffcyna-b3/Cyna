
import Category from '../models/Category';
import { ListPromise } from '../types/ListPromise';
import { AbstractRepository } from './abstract.repository';

export default class CategoryRepository extends AbstractRepository<Category> {
    constructor() {
        super(Category);
        this.defaultIncludes = [];
    }

    async listCategories(): Promise<ListPromise<Category>> {
        return await this.list();
    }
}
