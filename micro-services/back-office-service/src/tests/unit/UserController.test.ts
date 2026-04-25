import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { UserController } from '../../controllers/UserController';
import { IUserService } from '../../interfaces/IUserService';
import { UserAdminDTO } from '../../dto/UserAdminDTO';

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
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const makeServiceMock = () => {
  const service = {
    getAll: vi.fn(),
    getById: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
  };
  return service as unknown as IUserService & {
    [K in keyof IUserService]: ReturnType<typeof vi.fn>;
  };
};

const fakeUser: UserAdminDTO = {
  id: 'user-1',
  full_name: 'Alice Martin',
  email: 'alice@example.com',
  role: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-06-01T00:00:00.000Z',
};

describe('UserController', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: UserController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new UserController(service);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateRole', () => {
    it('retourne 200 avec UserAdminDTO mis à jour', async () => {
      const req = mockReq({ params: { id: 'user-1' }, body: { role: 'admin' } }) as any;
      const res = mockRes();
      service.updateRole.mockResolvedValue(fakeUser);

      await controller.updateRole(req, res);

      expect(service.updateRole).toHaveBeenCalledWith('user-1', 'admin');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeUser });
    });

    it("propage l'erreur 400 si rôle invalide", async () => {
      const req = mockReq({ params: { id: 'user-1' }, body: { role: 'superuser' } }) as any;
      const res = mockRes();
      service.updateRole.mockRejectedValue({ status: 400, error: 'INVALID_ROLE' });

      await expect(controller.updateRole(req, res)).rejects.toMatchObject({ status: 400 });
    });

    it("propage l'erreur 404 si user inexistant", async () => {
      const req = mockReq({ params: { id: 'missing' }, body: { role: 'user' } }) as any;
      const res = mockRes();
      service.updateRole.mockRejectedValue({ status: 404, error: 'USER_NOT_FOUND' });

      await expect(controller.updateRole(req, res)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('delete', () => {
    it('retourne 204 sans body', async () => {
      const req = mockReq({ params: { id: 'user-1' } }) as any;
      const res = mockRes();
      service.delete.mockResolvedValue(undefined);

      await controller.delete(req, res);

      expect(service.delete).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("propage l'erreur 404 si user inexistant", async () => {
      const req = mockReq({ params: { id: 'missing' } }) as any;
      const res = mockRes();
      service.delete.mockRejectedValue({ status: 404, error: 'USER_NOT_FOUND' });

      await expect(controller.delete(req, res)).rejects.toMatchObject({ status: 404 });
    });
  });
});
