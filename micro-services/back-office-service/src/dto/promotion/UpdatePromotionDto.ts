import { PromotionType } from '../../enum/PromotionType';

export interface UpdatePromotionDto {
    code?: string;
    discount_type?: PromotionType;
    discount_value?: number;
    active?: boolean;
}
