import Product from '../models/Product';
import {
    CreateProductDto,
    ProductImageDto,
    ProductFiltersDto,
    ReorderDisplayPriorityItemDto,
    UpdateProductImageDto,
    UpdateProductDto,
    UpdateStockDto,
} from '../dto/product';

export interface IProductService {
    list(filters: ProductFiltersDto): Promise<Product[]>;
    getById(id: string): Promise<Product>;
    create(input: CreateProductDto): Promise<Product>;
    update(id: string, input: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<{ deleted: boolean }>;
    updateStock(id: string, input: UpdateStockDto): Promise<Product>;
    getImage(id: string): Promise<ProductImageDto>;
    updateImage(id: string, input: UpdateProductImageDto): Promise<ProductImageDto>;
    setMaintenance(id: string, maintenance: boolean): Promise<Product>;
    updatePriority(id: string, priority: number): Promise<Product>;
    reorderDisplayPriority(items: ReorderDisplayPriorityItemDto[]): Promise<Product[]>;
}

