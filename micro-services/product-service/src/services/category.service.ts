import CategoryRepository from '../repository/category.repository';
import Category from '../models/Category';
import { Logger } from '../common/logger';

export default class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) {}

    async listCategories(): Promise<Category[]> {
        const res = await this.categoryRepository.listCategories();
        return res.rows.map((category) => {
            const plainCategory = category.toJSON ? category.toJSON() : (category as any).dataValues || category;
            return {
                ...plainCategory,
                image: this.imageToBuffer(plainCategory.image),
            };
        }) as unknown as Category[];
    }

    private imageToBuffer(categoryImage: Buffer | null): string | null {
        if (!categoryImage) {
            return null;
        }
        try {
            return categoryImage.toString('base64');
        } catch (error) {
            Logger.error('Error converting image to buffer', error);
            return null;
        }
    }
}
