import type { UserAdminDTO } from '@/types/interfaces/admin/UserAdminDTO.interface';
import type { OrderAdminDTO } from '@/types/interfaces/admin/OrderAdminDTO.interface';
import type { TransactionAdminDTO } from '@/types/interfaces/admin/TransactionAdminDTO.interface';
import type { RefundAdminDTO } from '@/types/interfaces/admin/RefundAdminDTO.interface';

export const usersMockData: UserAdminDTO[] = [
  { id: '1', full_name: 'John Doe', email: 'john.doe@gmail.com', role: 'admin', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
  { id: '2', full_name: 'Jane Doe', email: 'jane.doe@gmail.com', role: 'user', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
  { id: '3', full_name: 'Bob Smith', email: 'bob.smith@gmail.com', role: 'user', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
];

export const ordersMockData: OrderAdminDTO[] = [
  { id: '1', user_id: '1', total_amount: 100, status: 'pending', stripe_payment_intent_id: 'pi_test_1', created_at: '2024-01-01T00:00:00.000Z', items: [] },
  { id: '2', user_id: '2', total_amount: 200, status: 'completed', stripe_payment_intent_id: 'pi_test_2', created_at: '2024-01-01T00:00:00.000Z', items: [] },
  { id: '3', user_id: '3', total_amount: 300, status: 'cancelled', stripe_payment_intent_id: 'pi_test_3', created_at: '2024-01-01T00:00:00.000Z', items: [] },
];

export const transactionsMockData: TransactionAdminDTO[] = [
  { id: 'txn_1MiN3gLkdIwHu7ixxapQrznl', amount: -400, currency: 'usd', status: 'available', created: 1678043844, description: null },
];

export const refundsMockData: RefundAdminDTO[] = [
  { id: 're_1Nispe2eZvKYlo2Cd31jOCgZ', amount: 1000, status: 'succeeded', reason: null, payment_intent: 'pi_1GszsK2eZvKYlo2CfhZyoZLp', created: 1692942318 },
];
