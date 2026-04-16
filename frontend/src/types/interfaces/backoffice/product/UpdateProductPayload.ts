import { ProductStatus } from '@/types/enums/product/ProductStatus';

export interface UpdateProductPayload {
    category_id?: string;
    name?: string;
    description?: string | null;
    price?: number;
    stock?: number;
    duration?: number | null;
    priority?: number;
    status?: ProductStatus;
}
