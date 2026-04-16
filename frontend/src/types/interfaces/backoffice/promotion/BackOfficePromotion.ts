import type { PromotionType } from '@/types/interfaces/backoffice/promotion/PromotionType';
import type { BackOfficePromotionProduct } from '@/types/interfaces/backoffice/promotion/BackOfficePromotionProduct';

export interface BackOfficePromotion {
    id: string;
    code: string;
    discount_type: PromotionType;
    discount_value: number;
    active: boolean;
    created_at: string;
    updated_at: string;
    products?: BackOfficePromotionProduct[];
}
