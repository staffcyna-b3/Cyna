import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OrderController } from '../../controllers/OrderController';
import { IOrderService } from '../../interfaces/IOrderService';
import { OrderAdminDTO } from '../../dto/OrderAdminDTO';

const mockReq = (overrides: Record<string, unknown> = {}) => ({
  body: {},
  query: {},
  params: {},
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
    getAll: vi.fn(),
    getById: vi.fn(),
    updateStatus: vi.fn(),
  };
  return service as unknown as IOrderService & {
    [K in keyof IOrderService]: ReturnType<typeof vi.fn>;
  };
};

const fakeOrder: OrderAdminDTO = {
  id: 'order-1',
  user_id: 'user-1',
  status: 'CANCELLED',
  total_amount: 5000,
  stripe_payment_intent_id: 'pi_test',
  created_at: '2024-03-01T00:00:00.000Z',
  items: [],
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

  describe('updateStatus', () => {
    it('retourne 200 avec OrderAdminDTO mis à jour', async () => {
      const req = mockReq({ params: { id: 'order-1' }, body: { status: 'CANCELLED' } }) as any;
      const res = mockRes();
      service.updateStatus.mockResolvedValue(fakeOrder);

      await controller.updateStatus(req, res);

      expect(service.updateStatus).toHaveBeenCalledWith('order-1', 'CANCELLED');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeOrder });
    });

    it("propage l'erreur 400 si statut invalide", async () => {
      const req = mockReq({ params: { id: 'order-1' }, body: { status: 'INVALID' } }) as any;
      const res = mockRes();
      service.updateStatus.mockRejectedValue({ status: 400, error: 'INVALID_STATUS' });

      await expect(controller.updateStatus(req, res)).rejects.toMatchObject({ status: 400 });
    });

    it("propage l'erreur 404 si order inexistant", async () => {
      const req = mockReq({ params: { id: 'missing' }, body: { status: 'PAID' } }) as any;
      const res = mockRes();
      service.updateStatus.mockRejectedValue({ status: 404, error: 'ORDER_NOT_FOUND' });

      await expect(controller.updateStatus(req, res)).rejects.toMatchObject({ status: 404 });
    });
  });
});
