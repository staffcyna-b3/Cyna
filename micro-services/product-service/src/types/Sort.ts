import { SortBy } from "../enum/SortBy.enum";
import { SortOrder } from "../enum/Sortrder.enum";

export interface Sort {
    sortBy: SortBy.NAME | SortBy.PRICE | SortBy.PRIORITY;
    sortOrder: SortOrder.ASC | SortOrder.DESC;
}