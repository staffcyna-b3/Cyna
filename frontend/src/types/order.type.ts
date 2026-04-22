export type Order = {
    id: string,
    user_id: string,
    total_amount: number,
    status: "pending" | "completed" | "cancelled",
    stripe_payment_intent_id: string,
    created_at: string,
    updated_at: string,
}   