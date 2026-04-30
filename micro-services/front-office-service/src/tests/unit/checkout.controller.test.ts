import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CheckoutController } from '../../controllers/checkout.controller';
import { ICheckoutService } from '../../interfaces/CheckoutService';
import { HttpError } from '../../common/httpError';

const VALID_USER_UUID = '00000000-0000-0000-0000-000000009999';

type MockReqOverrides = Record<string, unknown>;

const mockReq = (overrides: MockReqOverrides = {}) => ({
  headers: { 'x-user-id': VALID_USER_UUID },
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
    getCheckoutContext: vi.fn(),
  };
  return service as unknown as ICheckoutService & {
    [K in keyof ICheckoutService]: ReturnType<typeof vi.fn>;
  };
};

describe('CheckoutController', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: CheckoutController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new CheckoutController(service);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCheckoutContext', () => {
    it('returns 200 with checkout context on happy path', async () => {
      const fakeContext = {
        user: { id: VALID_USER_UUID, email: 'test@example.com', fullName: 'Test User' },
        cart: { id: 'cart-1', items: [] },
        addresses: {
          billing: { id: 'billing-1', addressLine1: '1 rue de Paris', city: 'Paris', postcode: '75001', country: 'FR' },
          shipping: { id: 'shipping-1', addressLine1: '1 rue de Paris', city: 'Paris', postcode: '75001', country: 'FR' },
        },
        checkout: { cartId: 'cart-1', billingAddressId: 'billing-1', shippingAddressId: 'shipping-1' },
      };

      const req = mockReq() as any;
      const res = mockRes();

      service.getCheckoutContext.mockResolvedValue(fakeContext);

      await controller.getCheckoutContext(req, res);

      expect(service.getCheckoutContext).toHaveBeenCalledWith(VALID_USER_UUID);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeContext);
    });

    it('returns 401 when x-user-id header is missing', async () => {
      const req = mockReq({ headers: {} }) as any;
      const res = mockRes();

      await controller.getCheckoutContext(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(service.getCheckoutContext).not.toHaveBeenCalled();
    });

    it('returns 401 when x-user-id is not a valid UUID', async () => {
      const req = mockReq({ headers: { 'x-user-id': 'not-a-uuid' } }) as any;
      const res = mockRes();

      await controller.getCheckoutContext(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(service.getCheckoutContext).not.toHaveBeenCalled();
    });

    it('returns 404 when billing or shipping address is missing', async () => {
      const req = mockReq() as any;
      const res = mockRes();

      service.getCheckoutContext.mockRejectedValue(new HttpError(404, 'Missing billing or shipping address'));

      await controller.getCheckoutContext(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing billing or shipping address' });
    });

    it('returns 404 when cart is not found', async () => {
      const req = mockReq() as any;
      const res = mockRes();

      service.getCheckoutContext.mockRejectedValue(new HttpError(404, 'Cart not found'));

      await controller.getCheckoutContext(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });

    it('returns 500 with safe message on unexpected error', async () => {
      const req = mockReq() as any;
      const res = mockRes();

      service.getCheckoutContext.mockRejectedValue(new Error('DB connection lost'));

      await controller.getCheckoutContext(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      const responsePayload = res.json.mock.calls[0][0];
      expect(responsePayload).not.toHaveProperty('stack');
    });
  });
});
