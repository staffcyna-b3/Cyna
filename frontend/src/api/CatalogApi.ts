import { CatalogListResponse } from "../types/interfaces/catalog/CatalogListResponse";
import { CatalogFilters } from "../types/interfaces/catalog/CatelogFilters";
import { AbstractApi } from "./AbstractApi";

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

    async getCatalogList(payload: CatalogFilters): Promise<CatalogListResponse> {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        return await this.get<CatalogListResponse>(`/products/?${params.toString()}`);
    }
}