import type { PromotionType } from './PromotionType';

export type PromotionFormState = {
    code: string;
    discountType: PromotionType;
    discountValue: number;
    active: boolean;
    productIds: string[];
};
