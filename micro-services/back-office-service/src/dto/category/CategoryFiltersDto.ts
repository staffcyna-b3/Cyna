import { CategoryType } from '../../enum/CategoryType';

export interface CategoryFiltersDto {
    type?: CategoryType;
    search?: string;
}
