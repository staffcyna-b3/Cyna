import { SortOrder } from "../enums/SortOrder";

export interface Sort<T> {
    sortBy: T;
    sortOrder: SortOrder.ASC | SortOrder.DESC;
}