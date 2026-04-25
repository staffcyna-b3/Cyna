import { ProductStatus } from '@/types/enums/product/ProductStatus';

export interface BackOfficeProductQuery {
    search?: string;
    category_id?: string;
    is_service?: boolean;
    status?: ProductStatus;
}
