export type Transaction = {
    id: string,
    object: string,
    amount: number,
    available_on: number,
    created: number,
    currency: string,
    description: null,
    exchange_rate: null,
    fee: number,
    fee_details: [],
    net: number,
    reporting_category: string,
    source: string,
    status: string,
    type: string
}
