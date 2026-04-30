import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { RoleController } from '../controllers/role.controller';
import { UserRoleType } from '../enum/UserRoleType.enum';

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildApp = (controller: RoleController) => {
  const app = express();
  app.use(express.json());

  app.post('/roles/assign',         (req, res) => controller.assignRole(req, res));
  app.get('/roles/users',           (req, res) => controller.getAllUsersWithRoles(req, res));
  app.get('/roles/user/:userId',    (req, res) => controller.getUserWithRole(req, res));
  app.delete('/roles/user/:userId', (req, res) => controller.removeUserRoles(req, res));

  return app;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RoleController', () => {
  const mockService = {
    assignRole:          vi.fn(),
    getAllUsersWithRoles: vi.fn(),
    getUserWithRole:     vi.fn(),
    removeUserRoles:     vi.fn(),
  };

  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = buildApp(new RoleController(mockService));
  });

  // ── POST /roles/assign ────────────────────────────────────────────────────

  describe('POST /roles/assign', () => {
    it('données valides → 200 avec le résultat du service', async () => {
      const fakeRole = { id: 'role-1', user_id: 'user-1', role: UserRoleType.ADMIN };
      mockService.assignRole.mockResolvedValue(fakeRole);

      const res = await request(app)
        .post('/roles/assign')
        .send({ userId: 'user-1', role: UserRoleType.ADMIN });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeRole);
      expect(mockService.assignRole).toHaveBeenCalledWith('user-1', UserRoleType.ADMIN);
    });

    it('userId manquant → 400', async () => {
      const res = await request(app)
        .post('/roles/assign')
        .send({ role: UserRoleType.ADMIN });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
      expect(mockService.assignRole).not.toHaveBeenCalled();
    });

    it('role manquant → 400', async () => {
      const res = await request(app)
        .post('/roles/assign')
        .send({ userId: 'user-1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
      expect(mockService.assignRole).not.toHaveBeenCalled();
    });

    it('rôle inconnu → 400', async () => {
      const res = await request(app)
        .post('/roles/assign')
        .send({ userId: 'user-1', role: 'superadmin' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
      expect(mockService.assignRole).not.toHaveBeenCalled();
    });

    it('erreur service → 500', async () => {
      mockService.assignRole.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/roles/assign')
        .send({ userId: 'user-1', role: UserRoleType.ADMIN });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('INTERNAL_ERROR');
    });
  });

  // ── GET /roles/users ──────────────────────────────────────────────────────

  describe('GET /roles/users', () => {
    it('retourne la liste des utilisateurs avec leurs rôles', async () => {
      const fakeUsers = [
        { id: 'user-1', email: 'a@test.com', userRole: { role: UserRoleType.ADMIN } },
        { id: 'user-2', email: 'b@test.com', userRole: { role: UserRoleType.USER } },
      ];
      mockService.getAllUsersWithRoles.mockResolvedValue(fakeUsers);

      const res = await request(app).get('/roles/users');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('erreur service → 500', async () => {
      mockService.getAllUsersWithRoles.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/roles/users');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('INTERNAL_ERROR');
    });
  });

  // ── GET /roles/user/:userId ───────────────────────────────────────────────

  describe('GET /roles/user/:userId', () => {
    it('userId valide → 200 avec l\'utilisateur', async () => {
      const fakeUser = { id: 'user-1', email: 'a@test.com', userRole: { role: UserRoleType.COMMERCIAL } };
      mockService.getUserWithRole.mockResolvedValue(fakeUser);

      const res = await request(app).get('/roles/user/user-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeUser);
      expect(mockService.getUserWithRole).toHaveBeenCalledWith('user-1');
    });

    it('erreur service → 500', async () => {
      mockService.getUserWithRole.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/roles/user/user-1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('INTERNAL_ERROR');
    });
  });

  // ── DELETE /roles/user/:userId ────────────────────────────────────────────

  describe('DELETE /roles/user/:userId', () => {
    it('userId valide → 200 avec message de confirmation', async () => {
      mockService.removeUserRoles.mockResolvedValue(1);

      const res = await request(app).delete('/roles/user/user-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockService.removeUserRoles).toHaveBeenCalledWith('user-1');
    });

    it('erreur service → 500', async () => {
      mockService.removeUserRoles.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/roles/user/user-1');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('INTERNAL_ERROR');
    });
  });
});
