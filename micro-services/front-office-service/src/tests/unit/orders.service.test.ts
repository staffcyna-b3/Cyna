import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { OrderService } from '../../services/orders.service';
import { OrderStatus } from '../../enum/OrderStatus';
import { HttpError } from '../../common/httpError';
import { Logger } from '../../common/logger';
import { IOrderRepository } from '../../interfaces/OrderRepository';

const makeRepositoryMock = () => {
  const repository = {
    findAddressByIdAndUserId: vi.fn(),
    findCartWithItemsByIdAndUserId: vi.fn(),
    clearCartItems: vi.fn(),
    create: vi.fn(),
    createItems: vi.fn(),
    findAllByUserId: vi.fn(),
    findByIdWithItems: vi.fn(),
    findByIdAndUserId: vi.fn(),
    updateStatus: vi.fn(),
  };

  return repository as unknown as IOrderRepository & {
    [K in keyof IOrderRepository]: ReturnType<typeof vi.fn>;
  };
};

describe('OrderService', () => {
  let repository: ReturnType<typeof makeRepositoryMock>;
  let service: OrderService;

  const billingAddress = {
    toJSON: () => ({ id: 'billing-1', city: 'Paris', country: 'France' }),
  };

  const shippingAddress = {
    toJSON: () => ({ id: 'shipping-1', city: 'Lyon', country: 'France' }),
  };

  const orderWithItems = {
    id: 'order-1',
    user_id: '9999',
    userId: '9999',
    status: 'PENDING',
    total_amount: 109.97,
    totalAmount: 109.97,
    stripe_payment_intent_id: null,
    billing_address_snapshot: null,
    items: [
      {
        id: 'item-1',
        unit_price: 49.99,
        unitPrice: 49.99,
        quantity: 1,
        product: { name: 'Keyboard', is_service: false, duration: null },
      },
      {
        id: 'item-2',
        unit_price: 29.99,
        unitPrice: 29.99,
        quantity: 2,
        product: { name: 'Mouse', is_service: false, duration: null },
      },
    ],
    billingAddress: { city: 'Paris', country: 'France' },
    shippingAddress: { city: 'Lyon', country: 'France' },
    created_at: new Date('2026-03-20T10:00:00.000Z'),
    createdAt: '2026-03-20T10:00:00.000Z',
  };

  beforeEach(() => {
    repository = makeRepositoryMock();
    service = new OrderService(repository);
    vi.spyOn(Logger, 'info').mockImplementation(() => undefined);
    vi.spyOn(Logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as Response));
    process.env.GATEWAY_INTERNAL_URL = 'http://gateway.internal';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.GATEWAY_INTERNAL_URL;
  });

  describe('createOrder', () => {
    it('returns PENDING order with snapshotted items', async () => {
      repository.findAddressByIdAndUserId
        .mockResolvedValueOnce(billingAddress as any)
        .mockResolvedValueOnce(shippingAddress as any);
      repository.findCartWithItemsByIdAndUserId.mockResolvedValue({
        items: [
          { product_id: 'prod-1', quantity: 1, product: { price: 49.99 } },
          { product_id: 'prod-2', quantity: 2, product: { price: 29.99 } },
        ],
      } as any);
      repository.create.mockResolvedValue({ id: 'order-1', total_amount: 109.97 } as any);
      repository.createItems.mockResolvedValue([
        { id: 'item-1' },
        { id: 'item-2' },
      ] as any);
      repository.clearCartItems.mockResolvedValue(2);
      repository.findByIdWithItems.mockResolvedValue(orderWithItems as any);

      const result = await service.createOrder({
        userId: '9999',
        userEmail: 'test@example.com',
        cartId: '7001',
        billingAddressId: '9001',
        shippingAddressId: '9002',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OrderStatus.PENDING,
        })
      );
      expect(repository.createItems).toHaveBeenCalledWith([
        {
          order_id: 'order-1',
          product_id: 'prod-1',
          quantity: 1,
          unit_price: 49.99,
        },
        {
          order_id: 'order-1',
          product_id: 'prod-2',
          quantity: 2,
          unit_price: 29.99,
        },
      ]);
      expect(repository.clearCartItems).toHaveBeenCalledWith('7001');
      expect(result).toMatchObject({
        id: expect.any(String),
        status: 'PENDING',
        items: expect.any(Array),
        billingAddress: expect.any(Object),
        shippingAddress: expect.any(Object),
      });
    });

    it('does not block order creation when email dispatch is deferred', async () => {
      repository.findAddressByIdAndUserId
        .mockResolvedValueOnce(billingAddress as any)
        .mockResolvedValueOnce(shippingAddress as any);
      repository.findCartWithItemsByIdAndUserId.mockResolvedValue({
        items: [{ quantity: 1, product: { name: 'Keyboard', price: 49.99 } }],
      } as any);
      repository.create.mockResolvedValue({ id: 'order-2', total_amount: 49.99 } as any);
      repository.createItems.mockResolvedValue([{ id: 'item-1' }] as any);
      repository.clearCartItems.mockResolvedValue(1);
      repository.findByIdWithItems.mockResolvedValue(orderWithItems as any);

      await expect(
        service.createOrder({
          userId: '9999',
          userEmail: 'test@example.com',
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        })
      ).resolves.toBeDefined();

      expect(Logger.info).toHaveBeenCalledWith(
        'Order confirmation email dispatch deferred',
        expect.objectContaining({
          userId: '9999',
          orderId: 'order-2',
        })
      );
    });

    it('throws HttpError 422 when cart is empty', async () => {
      repository.findAddressByIdAndUserId
        .mockResolvedValueOnce(billingAddress as any)
        .mockResolvedValueOnce(shippingAddress as any);
      repository.findCartWithItemsByIdAndUserId.mockResolvedValue({ items: [] } as any);

      await expect(
        service.createOrder({
          userId: '9999',
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        })
      ).rejects.toMatchObject<HttpError>({ statusCode: 422 });
    });

    it('throws HttpError 404 when address is not found', async () => {
      repository.findAddressByIdAndUserId.mockResolvedValueOnce(null).mockResolvedValueOnce(shippingAddress as any);

      await expect(
        service.createOrder({
          userId: '9999',
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        })
      ).rejects.toMatchObject<HttpError>({ statusCode: 404 });
    });

    it('throws HttpError 404 when cart is not found', async () => {
      repository.findAddressByIdAndUserId
        .mockResolvedValueOnce(billingAddress as any)
        .mockResolvedValueOnce(shippingAddress as any);
      repository.findCartWithItemsByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.createOrder({
          userId: '9999',
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        })
      ).rejects.toMatchObject<HttpError>({ statusCode: 404 });
    });
  });

  describe('getOrdersByUserId', () => {
    it('returns only orders belonging to the user', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'PAID',
        total_amount: 50.0,
        created_at: new Date('2026-01-15T10:00:00.000Z'),
        stripe_payment_intent_id: null,
        items: [
          {
            id: 'item-1',
            unit_price: 50.0,
            quantity: 1,
            product: { name: 'Service A', is_service: false, duration: null },
          },
        ],
      };
      repository.findAllByUserId.mockResolvedValue([mockOrder] as any);

      const result = await service.getOrdersByUserId('user-123');

      expect(repository.findAllByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('order-1');
    });

    it('does not return orders belonging to another user', async () => {
      repository.findAllByUserId.mockResolvedValue([]);

      const result = await service.getOrdersByUserId('user-456');

      expect(result).toHaveLength(0);
      expect(repository.findAllByUserId).toHaveBeenCalledWith('user-456');
    });

    it('maps billing_period to monthly when duration is 30', async () => {
      repository.findAllByUserId.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PAID',
          total_amount: 50.0,
          created_at: new Date('2026-01-15T10:00:00.000Z'),
          stripe_payment_intent_id: null,
          items: [
            {
              id: 'item-1',
              unit_price: 50.0,
              quantity: 1,
              product: { name: 'Monthly Service', is_service: true, duration: 30 },
            },
          ],
        },
      ] as any);

      const result = await service.getOrdersByUserId('user-123');

      expect(result[0].billing_period).toBe('monthly');
    });

    it('maps billing_period to yearly when duration is 365', async () => {
      repository.findAllByUserId.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PAID',
          total_amount: 600.0,
          created_at: new Date('2026-01-15T10:00:00.000Z'),
          stripe_payment_intent_id: null,
          items: [
            {
              id: 'item-1',
              unit_price: 600.0,
              quantity: 1,
              product: { name: 'Annual Service', is_service: true, duration: 365 },
            },
          ],
        },
      ] as any);

      const result = await service.getOrdersByUserId('user-123');

      expect(result[0].billing_period).toBe('yearly');
    });

    it('returns null billing_period for unknown duration', async () => {
      repository.findAllByUserId.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PAID',
          total_amount: 50.0,
          created_at: new Date('2026-01-15T10:00:00.000Z'),
          stripe_payment_intent_id: null,
          items: [
            {
              id: 'item-1',
              unit_price: 50.0,
              quantity: 1,
              product: { name: 'Odd Service', is_service: true, duration: 90 },
            },
          ],
        },
      ] as any);

      const result = await service.getOrdersByUserId('user-123');

      expect(result[0].billing_period).toBeNull();
    });

    it('returns empty array when user has no orders', async () => {
      repository.findAllByUserId.mockResolvedValue([]);

      const result = await service.getOrdersByUserId('user-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('getOrderById', () => {
    it('returns order details when order belongs to user', async () => {
      repository.findByIdWithItems.mockResolvedValue(orderWithItems as any);

      const result = await service.getOrderById({ orderId: 'order-1', userId: '9999' });

      expect(repository.findByIdWithItems).toHaveBeenCalledWith('order-1');
      expect(result).toMatchObject({
        id: expect.any(String),
        status: expect.stringMatching(/PENDING|PAID|CANCELLED/),
        items: expect.any(Array),
        billingAddress: expect.any(Object),
        shippingAddress: expect.any(Object),
      });
    });

    it('throws HttpError 403 when order exists but user does not own it', async () => {
      repository.findByIdWithItems.mockResolvedValue({
        ...orderWithItems,
        user_id: 'different-user',
      } as any);

      await expect(service.getOrderById({ orderId: 'order-1', userId: '9999' })).rejects.toMatchObject<HttpError>({
        statusCode: 403,
      });
    });

    it('throws HttpError 404 when order does not exist', async () => {
      repository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.getOrderById({ orderId: 'missing-order', userId: '9999' })).rejects.toMatchObject<HttpError>({
        statusCode: 404,
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('updates status successfully and logs info', async () => {
      repository.updateStatus.mockResolvedValue({ id: 'order-1', status: OrderStatus.PAID } as any);

      await expect(service.updateOrderStatus('order-1', OrderStatus.PAID)).resolves.toBeUndefined();

      expect(Logger.info).toHaveBeenCalledWith('Order status updated', {
        orderId: 'order-1',
        status: OrderStatus.PAID,
      });
    });

    it('throws HttpError 404 when order is not found', async () => {
      repository.updateStatus.mockResolvedValue(null);

      await expect(service.updateOrderStatus('missing-order', OrderStatus.PAID)).rejects.toMatchObject<HttpError>({
        statusCode: 404,
      });
    });
  });
});
