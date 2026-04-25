import { ProductStatus } from '@/types/enums/product/ProductStatus';

export interface CreateSaasProductPayload {
    category_id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    priority?: number;
    status?: ProductStatus;
}
