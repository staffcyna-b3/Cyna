import { ProductStatus } from '../../enum/ProductStatus';

export interface CreateProductDto {
    category_id: string;
    name: string;
    description?: string | null;
    price: number;
    stock?: number;
    duration?: number | null;
    priority?: number;
    is_service: boolean;
    status?: ProductStatus;
}
