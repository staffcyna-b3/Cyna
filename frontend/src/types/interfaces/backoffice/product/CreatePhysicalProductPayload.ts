import { ProductStatus } from '@/types/enums/product/ProductStatus';

export interface CreatePhysicalProductPayload {
    category_id: string;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    priority?: number;
    status?: ProductStatus;
}
