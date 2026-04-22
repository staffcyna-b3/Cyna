import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { UserService } from '../../services/UserService';
import { IUserRepository, UserWithRoles } from '../../interfaces/IUserRepository';

const makeRepositoryMock = () => {
  const repo = {
    findAll: vi.fn(),
    findById: vi.fn(),
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
});
