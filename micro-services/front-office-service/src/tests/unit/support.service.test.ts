import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportService } from '../../services/support.service';
import { ISupportRepository } from '../../interfaces/ISupportRepository';
import { IMailService } from '../../interfaces/IMailService';

const makeRepoMock = () =>
  ({ create: vi.fn() }) as unknown as ISupportRepository & {
    create: ReturnType<typeof vi.fn>;
  };

const makeMailMock = () =>
  ({ sendContactNotification: vi.fn() }) as unknown as IMailService & {
    sendContactNotification: ReturnType<typeof vi.fn>;
  };

const payload = { email: 'user@example.com', subject: 'Test', message: 'Bonjour' };

describe('SupportService', () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let mail: ReturnType<typeof makeMailMock>;
  let service: SupportService;

  beforeEach(() => {
    repo = makeRepoMock();
    mail = makeMailMock();
    service = new SupportService(repo, mail);
    vi.clearAllMocks();
  });

  describe('submit', () => {
    it('persiste en BDD puis appelle mailService', async () => {
      repo.create.mockResolvedValue({} as any);
      mail.sendContactNotification.mockResolvedValue(undefined);

      await service.submit(payload);

      expect(repo.create).toHaveBeenCalledWith(payload);
      expect(mail.sendContactNotification).toHaveBeenCalledWith({
        fromEmail: payload.email,
        subject: payload.subject,
        message: payload.message,
      });
    });

    it('crée le message en BDD même si mailService throw', async () => {
      repo.create.mockResolvedValue({} as any);
      mail.sendContactNotification.mockRejectedValue(new Error('SMTP error'));

      await expect(service.submit(payload)).resolves.toBeUndefined();

      expect(repo.create).toHaveBeenCalledWith(payload);
    });

    it('ne propage pas l\'erreur mail — résout sans throw', async () => {
      repo.create.mockResolvedValue({} as any);
      mail.sendContactNotification.mockRejectedValue(new Error('network timeout'));

      await expect(service.submit(payload)).resolves.not.toThrow();
    });

    it('propage l\'erreur si la persistance BDD échoue', async () => {
      repo.create.mockRejectedValue(new Error('DB error'));

      await expect(service.submit(payload)).rejects.toThrow('DB error');

      expect(mail.sendContactNotification).not.toHaveBeenCalled();
    });
  });
});
