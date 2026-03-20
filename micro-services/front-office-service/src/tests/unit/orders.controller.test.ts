import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OrderController } from '../../controllers/orders.controller';
import { IOrderService } from '../../interfaces/OrderService';
import { HttpError } from '../../common/httpError';
import { OrderStatus } from '../../enum/OrderStatus';

type MockReqOverrides = Record<string, unknown>;

const mockReq = (overrides: MockReqOverrides = {}) => ({
  headers: { 'x-user-id': '9999' },
  params: {},
  body: {},
  ...overrides,
});

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeServiceMock = () => {
  const service = {
    createOrder: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
  };

  return service as unknown as IOrderService & {
    [K in keyof IOrderService]: ReturnType<typeof vi.fn>;
  };
};

describe('OrderController', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: OrderController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new OrderController(service);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('returns 201 with created order on happy path', async () => {
      const req = mockReq({
        body: {
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        },
      }) as any;
      const res = mockRes();
      const fakeOrder = { id: 'order-1', status: 'PENDING' };

      service.createOrder.mockResolvedValue(fakeOrder);

      await controller.create(req, res);

      expect(service.createOrder).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeOrder);
    });

    it('returns 401 when x-user-id header is missing', async () => {
      const req = mockReq({ headers: {} }) as any;
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(service.createOrder).not.toHaveBeenCalled();
    });

    it('returns 422 when required body fields are missing', async () => {
      const req = mockReq({ body: {} }) as any;
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(service.createOrder).not.toHaveBeenCalled();
    });

    it('maps HttpError 403 from service to HTTP 403', async () => {
      const req = mockReq({
        body: {
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        },
      }) as any;
      const res = mockRes();

      service.createOrder.mockRejectedValue(new HttpError(403, 'Forbidden'));

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('maps generic service error to HTTP 500 with safe message', async () => {
      const req = mockReq({
        body: {
          cartId: '7001',
          billingAddressId: '9001',
          shippingAddressId: '9002',
        },
      }) as any;
      const res = mockRes();

      service.createOrder.mockRejectedValue(new Error('unexpected failure'));

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      const responsePayload = res.json.mock.calls[0][0];
      expect(responsePayload).not.toHaveProperty('stack');
    });
  });

  describe('getById', () => {
    it('returns 200 and order payload on happy path', async () => {
      const req = mockReq({ params: { id: 'order-1' } }) as any;
      const res = mockRes();
      const fakeOrder = { id: 'order-1', status: 'PENDING' };

      service.getOrderById.mockResolvedValue(fakeOrder);

      await controller.getById(req, res);

      expect(service.getOrderById).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          userId: '9999',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeOrder);
    });

    it('maps HttpError 404 from service to HTTP 404', async () => {
      const req = mockReq({ params: { id: 'missing-order' } }) as any;
      const res = mockRes();

      service.getOrderById.mockRejectedValue(new HttpError(404, 'Order not found'));

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateStatus', () => {
    it('returns 200 when status update succeeds', async () => {
      const req = mockReq({
        params: { id: 'order-1' },
        body: { status: OrderStatus.PAID },
      }) as any;
      const res = mockRes();

      service.updateOrderStatus.mockResolvedValue(undefined);

      await controller.updateStatus(req, res);

      expect(service.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.PAID);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 422 when status value is invalid', async () => {
      const req = mockReq({
        params: { id: 'order-1' },
        body: { status: 'INVALID_VALUE' },
      }) as any;
      const res = mockRes();

      await controller.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(service.updateOrderStatus).not.toHaveBeenCalled();
    });

    it('maps service 404 error to HTTP 404', async () => {
      const req = mockReq({
        params: { id: 'missing-order' },
        body: { status: OrderStatus.PAID },
      }) as any;
      const res = mockRes();

      service.updateOrderStatus.mockRejectedValue(new HttpError(404, 'Order not found'));

      await controller.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
