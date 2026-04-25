export interface Category {
    id: string,
    name: string,
    description: string,
    image: string | null,
    type: string,
    priority?: number,
    created_at: string,
    updated_at: string,
}