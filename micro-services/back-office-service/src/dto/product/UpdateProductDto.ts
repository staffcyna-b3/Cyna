import { ProductStatus } from '../../enum/ProductStatus';

export interface UpdateProductDto {
    category_id?: string;
    name?: string;
    description?: string | null;
    price?: number;
    stock?: number;
    duration?: number | null;
    priority?: number;
    status?: ProductStatus;
}
