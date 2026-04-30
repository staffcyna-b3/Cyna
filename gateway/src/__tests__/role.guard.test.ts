import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { requireRole } from '../middlewares/role.guard';
import { UserRoleType } from '../enum/UserRoleType.enum';

const buildApp = (role?: UserRoleType) => {
  const app = express();
  app.use(express.json());

  if (role !== undefined) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.user = { userId: 'user-1', email: 'test@test.com', role };
      next();
    });
  }

  app.get('/backoffice', requireRole(UserRoleType.ADMIN, UserRoleType.COMMERCIAL), (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
};

describe('requireRole', () => {
  it('rôle ADMIN → next()', async () => {
    const res = await request(buildApp(UserRoleType.ADMIN)).get('/backoffice');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rôle COMMERCIAL → next()', async () => {
    const res = await request(buildApp(UserRoleType.COMMERCIAL)).get('/backoffice');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rôle USER sur route back-office → 403', async () => {
    const res = await request(buildApp(UserRoleType.USER)).get('/backoffice');

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('req.user absent → 401', async () => {
    const res = await request(buildApp()).get('/backoffice');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });
});
