import { PromotionType } from '../../enum/PromotionType';

export interface CreatePromotionDto {
    code: string;
    discount_type: PromotionType;
    discount_value: number;
    active?: boolean;
    product_ids?: string[];
}
