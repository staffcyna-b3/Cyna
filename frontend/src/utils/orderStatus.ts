export const ORDER_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PAID: 'default',
  CONFIRMED: 'default',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
};
