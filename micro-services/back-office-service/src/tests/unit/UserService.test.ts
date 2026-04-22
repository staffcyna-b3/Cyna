import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { UserService } from '../../services/UserService';
import { IUserRepository, UserWithRoles } from '../../interfaces/IUserRepository';

const makeRepositoryMock = () => {
  const repo = {
    findAll: vi.fn(),
    findById: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
  };
  return repo as unknown as IUserRepository & {
    [K in keyof IUserRepository]: ReturnType<typeof vi.fn>;
  };
};

const makeUser = (overrides: Partial<UserWithRoles> = {}): UserWithRoles => ({
  id: 'user-1',
  full_name: 'Alice Martin',
  email: 'alice@example.com',
  roles: [{ role: 'user' } as any],
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-06-01T00:00:00.000Z'),
  ...overrides,
} as unknown as UserWithRoles);

describe('UserService', () => {
  let repo: ReturnType<typeof makeRepositoryMock>;
  let service: UserService;

  beforeEach(() => {
    repo = makeRepositoryMock();
    service = new UserService(repo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('retourne UserAdminDTO[] sans password', async () => {
      repo.findAll.mockResolvedValue({ rows: [makeUser()], count: 1 });

      const result = await service.getAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password');
      expect(result.data[0]).toMatchObject({
        id: 'user-1',
        full_name: 'Alice Martin',
        email: 'alice@example.com',
        role: 'user',
      });
    });

    it('offset = (page - 1) * limit', async () => {
      repo.findAll.mockResolvedValue({ rows: [], count: 0 });

      await service.getAll(3, 10);

      expect(repo.findAll).toHaveBeenCalledWith(3, 10);
    });

    it('totalPages = ceil(count / limit)', async () => {
      repo.findAll.mockResolvedValue({ rows: [], count: 25 });

      const result = await service.getAll(1, 10);

      expect(result.totalPages).toBe(3);
    });

    it('retourne tableau vide si aucun user', async () => {
      repo.findAll.mockResolvedValue({ rows: [], count: 0 });

      const result = await service.getAll(1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('throw 404 si user null', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toMatchObject({ status: 404 });
    });

    it('password absent de la réponse', async () => {
      const userWithPassword = makeUser({ password: 'secret123' } as any);
      repo.findById.mockResolvedValue(userWithPassword);

      const result = await service.getById('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe('user-1');
    });
  });

  describe('updateRole', () => {
    it('met à jour le rôle avec une valeur valide', async () => {
      repo.updateRole.mockResolvedValue(makeUser({ roles: [{ role: 'admin' } as any] }));

      const result = await service.updateRole('user-1', 'admin');

      expect(repo.updateRole).toHaveBeenCalledWith('user-1', 'admin');
      expect(result.role).toBe('admin');
    });

    it('throw 400 si rôle invalide', async () => {
      await expect(service.updateRole('user-1', 'superuser')).rejects.toMatchObject({ status: 400, error: 'INVALID_ROLE' });
      expect(repo.updateRole).not.toHaveBeenCalled();
    });

    it('propage throw 404 si user inexistant', async () => {
      repo.updateRole.mockRejectedValue({ status: 404, error: 'USER_NOT_FOUND' });

      await expect(service.updateRole('missing', 'user')).rejects.toMatchObject({ status: 404 });
    });

    it('retourne UserAdminDTO sans password', async () => {
      repo.updateRole.mockResolvedValue(makeUser({ roles: [{ role: 'commercial' } as any] }));

      const result = await service.updateRole('user-1', 'commercial');

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: 'user-1', role: 'commercial' });
    });
  });

  describe('delete', () => {
    it('supprime le user via le repo', async () => {
      repo.delete.mockResolvedValue(undefined);

      await service.delete('user-1');

      expect(repo.delete).toHaveBeenCalledWith('user-1');
    });

    it('propage throw 404 si user inexistant', async () => {
      repo.delete.mockRejectedValue({ status: 404, error: 'USER_NOT_FOUND' });

      await expect(service.delete('missing')).rejects.toMatchObject({ status: 404 });
    });
  });
});
