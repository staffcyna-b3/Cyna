import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { PromoController } from '../../controllers/promo.controller';
import { IPromoService } from '../../interfaces/IPromoService';
import { HttpError } from '../../common/httpError';
import { Logger } from '../../common/logger';

const VALID_USER_UUID = '00000000-0000-0000-0000-000000001234';

const mockReq = (overrides: Record<string, unknown> = {}) => ({
  headers: { 'x-user-id': VALID_USER_UUID },
  body: { code: 'PROMO10' },
  ...overrides,
});

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeServiceMock = () => ({
  validate: vi.fn(),
  validateForCart: vi.fn(),
}) as unknown as IPromoService & {
  validate: ReturnType<typeof vi.fn>;
  validateForCart: ReturnType<typeof vi.fn>;
};

const fakePromoResult = {
  valid: true,
  promoCode: 'PROMO10',
  discountAmount: 10,
  discountedTotal: 90,
};

describe('PromoController.applyPromo', () => {
  let service: ReturnType<typeof makeServiceMock>;
  let controller: PromoController;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new PromoController(service);
    vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with promo result on happy path', async () => {
    const req = mockReq() as any;
    const res = mockRes();
    service.validateForCart.mockResolvedValue(fakePromoResult);

    await controller.applyPromo(req, res);

    expect(service.validateForCart).toHaveBeenCalledWith(VALID_USER_UUID, 'PROMO10');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakePromoResult);
  });

  it('uppercases the promo code before passing it to the service', async () => {
    const req = mockReq({ body: { code: 'promo10' } }) as any;
    const res = mockRes();
    service.validateForCart.mockResolvedValue(fakePromoResult);

    await controller.applyPromo(req, res);

    expect(service.validateForCart).toHaveBeenCalledWith(VALID_USER_UUID, 'PROMO10');
  });

  it('passes empty string to service when x-user-id header is missing', async () => {
    const req = mockReq({ headers: {} }) as any;
    const res = mockRes();
    service.validateForCart.mockResolvedValue(fakePromoResult);

    await controller.applyPromo(req, res);

    expect(service.validateForCart).toHaveBeenCalledWith('', 'PROMO10');
  });

  it('maps HttpError 422 from service when code is missing', async () => {
    const req = mockReq({ body: {} }) as any;
    const res = mockRes();
    service.validateForCart.mockRejectedValue(new HttpError(422, 'Le champ code est requis'));

    await controller.applyPromo(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('maps HttpError 422 from service when code is blank whitespace', async () => {
    const req = mockReq({ body: { code: '   ' } }) as any;
    const res = mockRes();
    service.validateForCart.mockRejectedValue(new HttpError(422, 'Le champ code est requis'));

    await controller.applyPromo(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('maps HttpError 404 from service to HTTP 404', async () => {
    const req = mockReq() as any;
    const res = mockRes();
    service.validateForCart.mockRejectedValue(new HttpError(404, 'Code invalide'));

    await controller.applyPromo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Code invalide' });
  });

  it('maps HttpError 422 from service to HTTP 422', async () => {
    const req = mockReq() as any;
    const res = mockRes();
    service.validateForCart.mockRejectedValue(new HttpError(422, 'Aucun article éligible'));

    await controller.applyPromo(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('maps generic error to HTTP 500 without leaking internal details', async () => {
    const req = mockReq() as any;
    const res = mockRes();
    service.validateForCart.mockRejectedValue(new Error('DB connection failed'));

    await controller.applyPromo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Erreur serveur interne');
    expect(payload).not.toHaveProperty('stack');
  });
});
