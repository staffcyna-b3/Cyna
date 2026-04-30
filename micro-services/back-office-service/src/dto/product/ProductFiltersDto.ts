import { ProductStatus } from '../../enum/ProductStatus';

export interface ProductFiltersDto {
    search?: string;
    is_service?: boolean;
    category_id?: string;
    status?: ProductStatus;
}
