import { CategoryType } from '../../enum/CategoryType';

export interface CategorySelectOptionDto {
    id: string;
    name: string;
    type: CategoryType;
}
