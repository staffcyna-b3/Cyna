import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RefundService } from '../../services/RefundService';
import { IHttpClient } from '../../interfaces/IHttpClient';
import { RefundAdminDTO } from '../../dto/RefundAdminDTO';

const makeHttpClientMock = () => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return client as unknown as IHttpClient & {
    [K in keyof IHttpClient]: ReturnType<typeof vi.fn>;
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

describe('RefundService', () => {
  let httpClient: ReturnType<typeof makeHttpClientMock>;
  let service: RefundService;

  beforeEach(() => {
    httpClient = makeHttpClientMock();
    service = new RefundService(httpClient);
    process.env.MS_PAYMENTS_URL = 'http://payments.internal';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MS_PAYMENTS_URL;
  });

  describe('create', () => {
    it('appelle httpClient.post avec payment_intent_id', async () => {
      httpClient.post.mockResolvedValue(fakeRefund);

      await service.create('pi_test');

      expect(httpClient.post).toHaveBeenCalledWith(
        'http://payments.internal/refund',
        expect.objectContaining({ payment_intent_id: 'pi_test' })
      );
    });

    it('inclut amount si fourni', async () => {
      httpClient.post.mockResolvedValue(fakeRefund);

      await service.create('pi_test', 500);

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ amount: 500 })
      );
    });

    it("n'inclut pas amount si undefined", async () => {
      httpClient.post.mockResolvedValue(fakeRefund);

      await service.create('pi_test', undefined);

      const body = httpClient.post.mock.calls[0][1] as Record<string, unknown>;
      expect(body).not.toHaveProperty('amount');
    });

    it('inclut reason si fournie', async () => {
      httpClient.post.mockResolvedValue(fakeRefund);

      await service.create('pi_test', undefined, 'duplicate');

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ reason: 'duplicate' })
      );
    });

    it("propage l'erreur si httpClient.post throw", async () => {
      httpClient.post.mockRejectedValue(new Error('network error'));

      await expect(service.create('pi_test')).rejects.toThrow('network error');
    });
  });
});
