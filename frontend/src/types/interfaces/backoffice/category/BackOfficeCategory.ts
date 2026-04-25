export interface BackOfficeCategory {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    type: 'service' | 'product';
    priority: number;
    created_at: string;
    updated_at: string;
}
