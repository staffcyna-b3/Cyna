import type { PromotionType } from '@/types/interfaces/backoffice/promotion/PromotionType';

export interface CreatePromotionPayload {
    code: string;
    discount_type: PromotionType;
    discount_value: number;
    active?: boolean;
    product_ids?: string[];
}
