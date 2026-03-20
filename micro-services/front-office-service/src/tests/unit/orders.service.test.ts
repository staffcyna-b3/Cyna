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
    userId: '9999',
    status: 'PENDING',
    totalAmount: 109.97,
    items: [
      { productName: 'Keyboard', quantity: 1, unitPrice: 49.99 },
      { productName: 'Mouse', quantity: 2, unitPrice: 29.99 },
    ],
    billingAddress: { city: 'Paris', country: 'France' },
    shippingAddress: { city: 'Lyon', country: 'France' },
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
          { quantity: 1, product: { name: 'Keyboard', price: 49.99 } },
          { quantity: 2, product: { name: 'Mouse', price: 29.99 } },
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
          product_name: 'Keyboard',
          quantity: 1,
          unit_price: 49.99,
        },
        {
          order_id: 'order-1',
          product_name: 'Mouse',
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
  });

  describe('getOrderById', () => {
    it('returns order details when order belongs to user', async () => {
      repository.findByIdAndUserId.mockResolvedValue({ id: 'order-1' } as any);
      repository.findByIdWithItems.mockResolvedValue(orderWithItems as any);

      const result = await service.getOrderById({ orderId: 'order-1', userId: '9999' });

      expect(result).toMatchObject({
        id: expect.any(String),
        status: expect.stringMatching(/PENDING|PAID|CANCELLED/),
        items: expect.any(Array),
        billingAddress: expect.any(Object),
        shippingAddress: expect.any(Object),
      });
    });

    it('throws HttpError 403 when order exists but user does not own it', async () => {
      repository.findByIdAndUserId.mockResolvedValue(null);
      repository.findByIdWithItems.mockResolvedValue({ id: 'order-1' } as any);

      await expect(service.getOrderById({ orderId: 'order-1', userId: '9999' })).rejects.toMatchObject<HttpError>({
        statusCode: 403,
      });
    });

    it('throws HttpError 404 when order does not exist', async () => {
      repository.findByIdAndUserId.mockResolvedValue(null);
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
