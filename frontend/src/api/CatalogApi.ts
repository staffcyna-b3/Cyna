import { CatalogResponse } from '@/types/interfaces/catalog/CatalogResponse';
import { CatalogListResponse } from '../types/interfaces/catalog/CatalogListResponse';
import { CatalogFilters } from '../types/interfaces/catalog/CatelogFilters';
import { AbstractApi } from './AbstractApi';
import { Category } from '@/types/interfaces/category/Category';

export class CatalogApi extends AbstractApi {
    private static instance: CatalogApi;

    private constructor() {
        super();
    }

    static getInstance() {
        if (!CatalogApi.instance) {
            CatalogApi.instance = new CatalogApi();
        }
        return CatalogApi.instance;
    }

    async getCatalogList(
        payload: CatalogFilters
    ): Promise<CatalogListResponse> {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const res = await this.get<{
            success: boolean;
            message?: string;
            data: CatalogListResponse;
        }>(`/products/?${params.toString()}`);

        return res.data;
    }

    async getOne(id: string): Promise<CatalogResponse> {
        const res = await this.get<{
            success: boolean;
            message?: string;
            data: CatalogResponse;
        }>('/products/' + id);
        return res.data;
    }

    async getSimilarProducts(productId: string): Promise<CatalogResponse[]> {
        const res = await this.get<{
            success: boolean;
            message?: string;
            data: CatalogResponse[];
        }>(`/products/similar/${productId}`);
        return res.data;
    }

    async listCategories(): Promise<Category[]> {
        const res = await this.get<{
            success: boolean;
            message?: string;
            data: Category[];
        }>('/products/categories/');
        return res.data;
    }
}
