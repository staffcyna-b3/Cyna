export interface ReorderProductPriorityPayload {
    items: Array<{
        id: string;
        priority: number;
    }>;
}
