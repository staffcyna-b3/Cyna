import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RefundController } from '../../controllers/RefundController';
import { IRefundService } from '../../interfaces/IRefundService';
import { RefundAdminDTO } from '../../dto/RefundAdminDTO';

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
    create: vi.fn(),
  };
  return service as unknown as IRefundService & {
    [K in keyof IRefundService]: ReturnType<typeof vi.fn>;
  };
};

const fakeRefund: RefundAdminDTO = {
  id: 'refund-1',
  amount: 1000,
  status: 'succeeded',
  reason: null,
  payment_intent: 'pi_test',
  created: 1700000000,
};

describe('RefundController', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: RefundController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new RefundController(service);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('retourne 400 si payment_intent_id absent', async () => {
      const req = mockReq({ body: {} }) as any;
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'MISSING_PAYMENT_INTENT_ID' })
      );
      expect(service.create).not.toHaveBeenCalled();
    });

    it('retourne 400 si amount est 0', async () => {
      const req = mockReq({ body: { payment_intent_id: 'pi_test', amount: 0 } }) as any;
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'INVALID_AMOUNT' })
      );
      expect(service.create).not.toHaveBeenCalled();
    });

    it('retourne 400 si amount est négatif', async () => {
      const req = mockReq({ body: { payment_intent_id: 'pi_test', amount: -50 } }) as any;
      const res = mockRes();

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'INVALID_AMOUNT' })
      );
      expect(service.create).not.toHaveBeenCalled();
    });

    it('retourne 201 avec le refund créé', async () => {
      const req = mockReq({ body: { payment_intent_id: 'pi_test', amount: 500 } }) as any;
      const res = mockRes();

      service.create.mockResolvedValue(fakeRefund);

      await controller.create(req, res);

      expect(service.create).toHaveBeenCalledWith('pi_test', 500, undefined);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeRefund });
    });

    it("propage l'erreur si refundService throw", async () => {
      const req = mockReq({ body: { payment_intent_id: 'pi_test' } }) as any;
      const res = mockRes();

      service.create.mockRejectedValue(new Error('stripe error'));

      await expect(controller.create(req, res)).rejects.toThrow('stripe error');
    });
  });

  describe('getAll', () => {
    it('retourne 200 avec liste', async () => {
      const req = mockReq({ query: {} }) as any;
      const res = mockRes();

      service.getAll.mockResolvedValue([fakeRefund]);

      await controller.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [fakeRefund] });
    });

    it('passe limit depuis query param au service', async () => {
      const req = mockReq({ query: { limit: '50' } }) as any;
      const res = mockRes();

      service.getAll.mockResolvedValue([]);

      await controller.getAll(req, res);

      expect(service.getAll).toHaveBeenCalledWith(50);
    });
  });
});
