import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportController } from '../../controllers/support.controller';
import { ISupportService } from '../../interfaces/ISupportService';

const makeServiceMock = () =>
  ({ submit: vi.fn() }) as unknown as ISupportService & {
    submit: ReturnType<typeof vi.fn>;
  };

const mockReq = (body: Record<string, unknown> = {}) =>
  ({ body }) as any;

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('SupportController', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: SupportController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new SupportController(service);
    vi.clearAllMocks();
  });

  describe('submit', () => {
    it('201 si payload valide', async () => {
      service.submit.mockResolvedValue(undefined);
      const req = mockReq({ email: 'user@example.com', subject: 'Test', message: 'Bonjour' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(service.submit).toHaveBeenCalledWith({
        email: 'user@example.com',
        subject: 'Test',
        message: 'Bonjour',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('trim les champs avant de passer au service', async () => {
      service.submit.mockResolvedValue(undefined);
      const req = mockReq({ email: '  user@example.com  ', subject: '  Sujet  ', message: '  Msg  ' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(service.submit).toHaveBeenCalledWith({
        email: 'user@example.com',
        subject: 'Sujet',
        message: 'Msg',
      });
    });

    it('400 MISSING_EMAIL si email absent', async () => {
      const req = mockReq({ subject: 'Test', message: 'Bonjour' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'MISSING_EMAIL' });
      expect(service.submit).not.toHaveBeenCalled();
    });

    it('400 MISSING_EMAIL si email vide ou espaces', async () => {
      const req = mockReq({ email: '   ', subject: 'Test', message: 'Bonjour' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'MISSING_EMAIL' });
    });

    it('400 INVALID_EMAIL_FORMAT si email invalide', async () => {
      const req = mockReq({ email: 'not-an-email', subject: 'Test', message: 'Bonjour' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'INVALID_EMAIL_FORMAT' });
      expect(service.submit).not.toHaveBeenCalled();
    });

    it('400 MISSING_SUBJECT si sujet absent', async () => {
      const req = mockReq({ email: 'user@example.com', message: 'Bonjour' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'MISSING_SUBJECT' });
      expect(service.submit).not.toHaveBeenCalled();
    });

    it('400 MISSING_MESSAGE si message absent', async () => {
      const req = mockReq({ email: 'user@example.com', subject: 'Test' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'MISSING_MESSAGE' });
      expect(service.submit).not.toHaveBeenCalled();
    });

    it('400 MISSING_MESSAGE si message uniquement espaces', async () => {
      const req = mockReq({ email: 'user@example.com', subject: 'Test', message: '   ' });
      const res = mockRes();

      await controller.submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'MISSING_MESSAGE' });
    });
  });
});
