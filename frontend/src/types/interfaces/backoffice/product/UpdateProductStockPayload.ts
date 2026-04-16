export interface UpdateProductStockPayload {
    operation: 'set' | 'increment' | 'decrement';
    quantity: number;
}
