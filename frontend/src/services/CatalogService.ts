import { CatalogApi } from '../api/CatalogApi';
import { CatalogFilters } from '../types/interfaces/catalog/CatalogFilters';
import { CatalogListResponse } from '../types/interfaces/catalog/CatalogListResponse';

export class CatalogService {
    private static instance: CatalogService;

    private api = CatalogApi.getInstance();

    static getInstance(): CatalogService {
        if (!CatalogService.instance) {
            CatalogService.instance = new CatalogService();
        }
        return CatalogService.instance;
    }

    public async getCatalogList(filters: Partial<CatalogFilters> = {}): Promise<CatalogListResponse> {
        const payload: CatalogFilters = {
            page: filters.page ?? 1,
            limit: filters.limit ?? 10,
            categoryId: filters.categoryId,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            search: filters.search,
            isService: filters.isService,
            inStock: filters.inStock,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
        };

        return await this.api.getCatalogList(payload);
    }

    public async getProductById(id: string) {
        return await this.api.getOne(id);
    }

    public async getSimilarProducts(productId: string) {
        return await this.api.getSimilarProducts(productId);
    }

    public async getProductSuggestions(search: string) {
        return await this.api.getProductSuggestions(search);
    }

    public async listCategories() {
        return await this.api.listCategories();
    }
}
