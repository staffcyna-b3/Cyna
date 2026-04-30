import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SalesController } from '../../controllers/SalesController';
import { ISalesService } from '../../services/ISalesService';
import { DashboardStats } from '../../services/SalesService';
import { SaleAdminDTO } from '../../dto/SaleAdminDTO';

const mockReq = (overrides: Record<string, unknown> = {}) => ({
  body: {},
  query: {},
  params: {},
  ...overrides,
});

const mockRes = () => {
  const res: Record<string, ReturnType<typeof vi.fn>> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeServiceMock = () => {
  const service = {
    getAll: vi.fn(),
    getDashboardStats: vi.fn(),
  };
  return service as unknown as ISalesService & {
    [K in keyof ISalesService]: ReturnType<typeof vi.fn>;
  };
};

const fakeSale: SaleAdminDTO = {
  id: 'sale-1',
  date: '2026-04-10T10:00:00.000Z',
  userEmail: 'user@example.com',
  productName: 'Produit A',
  categoryNames: ['EDR'],
  type: 'order',
  amount: 1000,
  status: 'PAID',
};

const fakeDashboardStats: DashboardStats = {
  totalRevenue: 5000,
  averageCart: 500,
  salesByPeriod: [{ date: '2026-04-10', total: 5000 }],
};

describe('SalesController', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: SalesController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new SalesController(service);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── getAll ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('retourne 200 avec la liste des ventes', async () => {
      const req = mockReq() as any;
      const res = mockRes();
      service.getAll.mockResolvedValue([fakeSale]);

      await controller.getAll(req, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [fakeSale] });
    });

    it('retourne 200 avec un tableau vide si aucune vente', async () => {
      const req = mockReq() as any;
      const res = mockRes();
      service.getAll.mockResolvedValue([]);

      await controller.getAll(req, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });
  });

  // ─── getDashboardStats ─────────────────────────────────────────────────────

  describe('getDashboardStats', () => {
    it('retourne 200 avec les statistiques si le service répond correctement', async () => {
      const req = mockReq({ query: { from: '2026-04-01', to: '2026-04-30' } }) as any;
      const res = mockRes();
      service.getDashboardStats.mockResolvedValue(fakeDashboardStats);

      await controller.getDashboardStats(req, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeDashboardStats });
      expect(service.getDashboardStats).toHaveBeenCalledWith(
        new Date('2026-04-01'),
        new Date('2026-04-30'),
      );
    });

    it('appelle le service sans dates si aucun paramètre fourni', async () => {
      const req = mockReq({ query: {} }) as any;
      const res = mockRes();
      service.getDashboardStats.mockResolvedValue(fakeDashboardStats);

      await controller.getDashboardStats(req, res as any);

      expect(service.getDashboardStats).toHaveBeenCalledWith(undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retourne 400 si from est une date invalide', async () => {
      const req = mockReq({ query: { from: 'pas-une-date', to: '2026-04-30' } }) as any;
      const res = mockRes();

      await controller.getDashboardStats(req, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
      expect(service.getDashboardStats).not.toHaveBeenCalled();
    });

    it('retourne 400 si to est une date invalide', async () => {
      const req = mockReq({ query: { from: '2026-04-01', to: 'invalid' } }) as any;
      const res = mockRes();

      await controller.getDashboardStats(req, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
      expect(service.getDashboardStats).not.toHaveBeenCalled();
    });

    it('retourne 400 si from est postérieur à to', async () => {
      const req = mockReq({ query: { from: '2026-04-30', to: '2026-04-01' } }) as any;
      const res = mockRes();

      await controller.getDashboardStats(req, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
      expect(service.getDashboardStats).not.toHaveBeenCalled();
    });

    it('retourne 500 si le service lève une erreur', async () => {
      const req = mockReq({ query: { from: '2026-04-01', to: '2026-04-30' } }) as any;
      const res = mockRes();
      service.getDashboardStats.mockRejectedValue(new Error('Erreur base de données'));

      await controller.getDashboardStats(req, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur base de données',
      });
    });

    it('retourne 500 avec message générique si erreur non-Error est levée', async () => {
      const req = mockReq({ query: { from: '2026-04-01', to: '2026-04-30' } }) as any;
      const res = mockRes();
      service.getDashboardStats.mockRejectedValue('crash inattendu');

      await controller.getDashboardStats(req, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur interne.',
      });
    });
  });
});
