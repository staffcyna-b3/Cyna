export type Refund = {
    id: string,
  object: string,
  amount: number,
  balance_transaction: string,
  charge: string,
  created: number,
  currency: string,
  destination_details: {
    card: {
      reference: string,
      reference_status: string,
      reference_type: string,
      type: string
    },
    type: string
  },
  metadata?: object,
  payment_intent: string,
  reason: null,
  receipt_number: null,
  source_transfer_reversal: null,
  status: string,
  transfer_reversal: null
}