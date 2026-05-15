import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SalesService } from '../../services/SalesService';
import { ISalesRepository } from '../../repositories/ISalesRepository';
import { SaleRow } from '../../interfaces/SaleRow.interface';

const makeRepositoryMock = () => {
  const repo = {
    findAllOrders: vi.fn(),
    findAllSubscriptions: vi.fn(),
  };
  return repo as unknown as ISalesRepository & {
    [K in keyof ISalesRepository]: ReturnType<typeof vi.fn>;
  };
};

const makeSaleRow = (overrides: Partial<SaleRow> = {}): SaleRow => ({
  id: 'sale-1',
  date: new Date('2026-04-10T10:00:00.000Z'),
  userEmail: 'user@example.com',
  productNames: ['Produit A'],
  categoryNames: ['EDR'],
  type: 'order',
  amount: 1000,
  status: 'PAID',
  ...overrides,
});

describe('SalesService', () => {
  let repo: ReturnType<typeof makeRepositoryMock>;
  let service: SalesService;

  beforeEach(() => {
    repo = makeRepositoryMock();
    service = new SalesService(repo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── getAll ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('retourne un tableau vide si le repository ne retourne aucune vente', async () => {
      repo.findAllOrders.mockResolvedValue([]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });

    it('fusionne orders et subscriptions dans le résultat', async () => {
      repo.findAllOrders.mockResolvedValue([makeSaleRow({ id: 'order-1', type: 'order' })]);
      repo.findAllSubscriptions.mockResolvedValue([makeSaleRow({ id: 'sub-1', type: 'subscription' })]);

      const result = await service.getAll();

      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toContain('order-1');
      expect(result.map((s) => s.id)).toContain('sub-1');
    });

    it('trie les résultats par date décroissante', async () => {
      const older = makeSaleRow({ id: 'old', date: new Date('2026-04-01T00:00:00.000Z') });
      const newer = makeSaleRow({ id: 'new', date: new Date('2026-04-20T00:00:00.000Z') });
      repo.findAllOrders.mockResolvedValue([older]);
      repo.findAllSubscriptions.mockResolvedValue([newer]);

      const result = await service.getAll();

      expect(result[0].id).toBe('new');
      expect(result[1].id).toBe('old');
    });

    it('formatProductName retourne "—" si productNames est vide', async () => {
      repo.findAllOrders.mockResolvedValue([makeSaleRow({ productNames: [] })]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result[0].productName).toBe('—');
    });

    it('formatProductName retourne "—" si tous les noms sont null', async () => {
      repo.findAllOrders.mockResolvedValue([makeSaleRow({ productNames: [null, null] })]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result[0].productName).toBe('—');
    });

    it('formatProductName joint plusieurs noms par ", "', async () => {
      repo.findAllOrders.mockResolvedValue([makeSaleRow({ productNames: ['Produit A', 'Produit B'] })]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result[0].productName).toBe('Produit A, Produit B');
    });

    it('convertit la date en ISO string dans le DTO', async () => {
      const date = new Date('2026-04-10T10:00:00.000Z');
      repo.findAllOrders.mockResolvedValue([makeSaleRow({ date })]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result[0].date).toBe(date.toISOString());
    });
  });

  // ─── getDashboardStats ─────────────────────────────────────────────────────

  describe('getDashboardStats', () => {
    it('par défaut, la période couvre les 30 derniers jours', async () => {
      repo.findAllOrders.mockResolvedValue([]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const before = new Date();
      await service.getDashboardStats();
      const after = new Date();

      const filter = repo.findAllOrders.mock.calls[0][0];
      expect(filter).toBeDefined();

      const diffDays = (filter.to.getTime() - filter.from.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(30, 0);
      expect(filter.to.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(filter.to.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('respecte la date from si elle est fournie', async () => {
      repo.findAllOrders.mockResolvedValue([]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const from = new Date('2026-01-01T00:00:00.000Z');
      await service.getDashboardStats(from);

      const filter = repo.findAllOrders.mock.calls[0][0];
      expect(filter.from.toISOString()).toBe(from.toISOString());
    });

    it('exclut les ventes avec statut PENDING du calcul', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ id: 'paid', status: 'PAID', amount: 500 }),
        makeSaleRow({ id: 'pending', status: 'PENDING', amount: 999 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.totalRevenue).toBe(500);
    });

    it('exclut les ventes avec statut CANCELLED du calcul', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ id: 'paid', status: 'PAID', amount: 200 }),
        makeSaleRow({ id: 'cancelled', status: 'CANCELLED', amount: 800 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.totalRevenue).toBe(200);
    });

    it('totalRevenue est la somme des montants des ventes valides uniquement', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ status: 'PAID', amount: 300 }),
        makeSaleRow({ status: 'PAID', amount: 700 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([
        makeSaleRow({ type: 'subscription', status: 'active', amount: 500 }),
      ]);

      const result = await service.getDashboardStats();

      expect(result.totalRevenue).toBe(1500);
    });

    it('averageCart = totalRevenue / nombre de ventes valides (orders + subscriptions)', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ status: 'PAID', amount: 600 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([
        makeSaleRow({ type: 'subscription', status: 'active', amount: 400 }),
      ]);

      const result = await service.getDashboardStats();

      expect(result.averageCart).toBe(500);
    });

    it('averageCart vaut 0 si aucune vente valide sur la période', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ status: 'CANCELLED', amount: 999 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.averageCart).toBe(0);
    });

    it('salesByPeriod groupe correctement par jour au format YYYY-MM-DD', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ date: new Date('2026-04-10T08:00:00.000Z'), status: 'PAID', amount: 100 }),
        makeSaleRow({ date: new Date('2026-04-10T18:00:00.000Z'), status: 'PAID', amount: 200 }),
        makeSaleRow({ date: new Date('2026-04-11T10:00:00.000Z'), status: 'PAID', amount: 400 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.salesByPeriod).toHaveLength(2);
      expect(result.salesByPeriod.find((p) => p.date === '2026-04-10')?.total).toBe(300);
      expect(result.salesByPeriod.find((p) => p.date === '2026-04-11')?.total).toBe(400);
    });

    it('salesByPeriod est trié par date croissante', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ date: new Date('2026-04-15T00:00:00.000Z'), status: 'PAID', amount: 100 }),
        makeSaleRow({ date: new Date('2026-04-10T00:00:00.000Z'), status: 'PAID', amount: 200 }),
        makeSaleRow({ date: new Date('2026-04-12T00:00:00.000Z'), status: 'PAID', amount: 300 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      const dates = result.salesByPeriod.map((p) => p.date);
      expect(dates).toEqual([...dates].sort());
    });

    it('salesByPeriod exclut les ventes non valides du regroupement', async () => {
      repo.findAllOrders.mockResolvedValue([
        makeSaleRow({ date: new Date('2026-04-10T00:00:00.000Z'), status: 'PAID', amount: 100 }),
        makeSaleRow({ date: new Date('2026-04-10T00:00:00.000Z'), status: 'PENDING', amount: 999 }),
      ]);
      repo.findAllSubscriptions.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.salesByPeriod).toHaveLength(1);
      expect(result.salesByPeriod[0].total).toBe(100);
    });
  });
});
