import { ProductStatus } from '@/types/enums/product/ProductStatus';
import type { BackOfficeCategory } from '@/types/interfaces/backoffice/category/BackOfficeCategory';

export interface BackOfficeProduct {
    id: string;
    category_id: string;
    category?: Pick<BackOfficeCategory, 'id' | 'name' | 'type'>;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    status: ProductStatus;
    is_service: boolean;
    duration?: number | null;
    priority: number;
    created_at: string;
    updated_at: string;
}
