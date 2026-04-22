import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OrderService } from '../../services/OrderService';
import { IOrderRepository, OrderWithItems } from '../../interfaces/IOrderRepository';

const makeRepositoryMock = () => {
  const repo = {
    findAll: vi.fn(),
    findById: vi.fn(),
  };
  return repo as unknown as IOrderRepository & {
    [K in keyof IOrderRepository]: ReturnType<typeof vi.fn>;
  };
};

const makeOrder = (overrides: Partial<OrderWithItems> = {}): OrderWithItems => ({
  id: 'order-1',
  user_id: 'user-1',
  status: 'PAID',
  total_amount: 5000,
  stripe_payment_intent_id: 'pi_test',
  created_at: new Date('2024-03-01T00:00:00.000Z'),
  items: [
    {
      product_id: 'prod-1',
      quantity: 2,
      unit_price: 2500,
      product: { name: 'VPN Pro' } as any,
    } as any,
  ],
  ...overrides,
} as unknown as OrderWithItems);

describe('OrderService', () => {
  let repo: ReturnType<typeof makeRepositoryMock>;
  let service: OrderService;

  beforeEach(() => {
    repo = makeRepositoryMock();
    service = new OrderService(repo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('retourne OrderAdminDTO avec items', async () => {
      repo.findAll.mockResolvedValue({ rows: [makeOrder()], count: 1 });

      const result = await service.getAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].items).toHaveLength(1);
      expect(result.data[0].items[0].product_name).toBe('VPN Pro');
    });

    it('unit_price présent dans les items', async () => {
      repo.findAll.mockResolvedValue({ rows: [makeOrder()], count: 1 });

      const result = await service.getAll(1, 10);

      expect(result.data[0].items[0]).toHaveProperty('unit_price');
      expect(typeof result.data[0].items[0].unit_price).toBe('number');
    });

    it('pagination correcte', async () => {
      repo.findAll.mockResolvedValue({ rows: [], count: 30 });

      const result = await service.getAll(2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.total).toBe(30);
    });
  });

  describe('getById', () => {
    it('throw 404 si order null', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toMatchObject({ status: 404 });
    });

    it('stripe_payment_intent_id null si absent', async () => {
      repo.findById.mockResolvedValue(makeOrder({ stripe_payment_intent_id: undefined } as any));

      const result = await service.getById('order-1');

      expect(result.stripe_payment_intent_id).toBeNull();
    });
  });
});
