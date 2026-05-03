import Category from '../models/Category';
import Product, { ProductCreationAttributes } from '../models/Product';
import ProductImage from '../models/ProductImage';
import { ProductFiltersDto, ReorderDisplayPriorityItemDto } from '../dto/product';

export interface IProductRepository {
    list(filters: ProductFiltersDto): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    create(payload: ProductCreationAttributes): Promise<Product>;
    update(product: Product, payload: Partial<ProductCreationAttributes>): Promise<Product>;
    delete(product: Product): Promise<void>;
    findCategoryById(categoryId: string): Promise<Category | null>;
    findMainImage(productId: string): Promise<ProductImage | null>;
    upsertMainImage(productId: string, image: Buffer, altText?: string | null): Promise<void>;
    reorderDisplayPriority(items: ReorderDisplayPriorityItemDto[]): Promise<Product[]>;
    findProductsByIds(productIds: string[]): Promise<Product[]>;
}

