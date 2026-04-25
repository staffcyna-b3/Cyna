export interface ListPromise<T> {
    rows: T[];
    count: number;
    page: number;
    totalPages: number 
}