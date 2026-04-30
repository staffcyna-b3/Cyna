export interface UpdateStockDto {
    operation: 'set' | 'increment' | 'decrement';
    quantity: number;
}
