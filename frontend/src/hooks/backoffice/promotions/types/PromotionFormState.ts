import type { PromotionType } from '@/types/interfaces/backoffice/promotion';

export type PromotionFormState = {
    code: string;
    discountType: PromotionType;
    discountValue: number;
    active: boolean;
    productIds: string[];
};