import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportService } from '../../services/support.service';
import { ISupportRepository } from '../../interfaces/ISupportRepository';
import { IMailService } from '../../interfaces/IMailService';
import ContactMessage from '../../models/ContactMessage';

const makeRepoMock = () =>
  ({
    findAll: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  }) as unknown as ISupportRepository & {
    [K in keyof ISupportRepository]: ReturnType<typeof vi.fn>;
  };

const makeMailMock = () =>
  ({ sendReply: vi.fn() }) as unknown as IMailService & {
    sendReply: ReturnType<typeof vi.fn>;
  };

const makeMsg = (overrides: Partial<ContactMessage> = {}): ContactMessage =>
  ({
    id: 'msg-1',
    email: 'user@example.com',
    subject: 'Problème de connexion',
    message: 'Je ne peux pas me connecter.',
    status: 'new',
    created_at: new Date('2026-01-15T10:00:00.000Z'),
    updated_at: new Date('2026-01-15T10:00:00.000Z'),
    ...overrides,
  }) as unknown as ContactMessage;

describe('SupportService (back-office)', () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let mail: ReturnType<typeof makeMailMock>;
  let service: SupportService;

  beforeEach(() => {
    repo = makeRepoMock();
    mail = makeMailMock();
    service = new SupportService(repo, mail);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('retourne la liste des messages sous forme de DTO', async () => {
      repo.findAll.mockResolvedValue([makeMsg()]);

      const result = await service.getAll();

      expect(repo.findAll).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'msg-1',
        email: 'user@example.com',
        status: 'new',
      });
      expect(result[0]).not.toHaveProperty('updated_at');
    });

    it('retourne un tableau vide si aucun message', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('retourne le DTO si message trouvé', async () => {
      repo.findById.mockResolvedValue(makeMsg());

      const result = await service.getById('msg-1');

      expect(result).toMatchObject({ id: 'msg-1', email: 'user@example.com' });
    });

    it('throw 404 si message inexistant', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toMatchObject({
        status: 404,
        error: 'CONTACT_MESSAGE_NOT_FOUND',
      });
    });
  });

  describe('markAsProcessed', () => {
    it('retourne le DTO avec status processed', async () => {
      repo.updateStatus.mockResolvedValue(makeMsg({ status: 'processed' }));

      const result = await service.markAsProcessed('msg-1');

      expect(repo.updateStatus).toHaveBeenCalledWith('msg-1', 'processed');
      expect(result.status).toBe('processed');
    });

    it('propage 404 si le repo ne trouve pas le message', async () => {
      repo.updateStatus.mockRejectedValue({ status: 404, error: 'CONTACT_MESSAGE_NOT_FOUND' });

      await expect(service.markAsProcessed('missing')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('reply', () => {
    it('appelle mailService.sendReply avec to=message.email', async () => {
      repo.findById.mockResolvedValue(makeMsg());
      mail.sendReply.mockResolvedValue(undefined);
      repo.updateStatus.mockResolvedValue(makeMsg({ status: 'processed' }));

      await service.reply('msg-1', 'Voici notre réponse.');

      expect(mail.sendReply).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Problème de connexion',
        replyMessage: 'Voici notre réponse.',
        originalMessage: 'Je ne peux pas me connecter.',
      });
    });

    it('marque le message processed après envoi', async () => {
      repo.findById.mockResolvedValue(makeMsg());
      mail.sendReply.mockResolvedValue(undefined);
      repo.updateStatus.mockResolvedValue(makeMsg({ status: 'processed' }));

      const result = await service.reply('msg-1', 'Voici notre réponse.');

      expect(repo.updateStatus).toHaveBeenCalledWith('msg-1', 'processed');
      expect(result.status).toBe('processed');
    });

    it('throw 404 si message inexistant', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.reply('missing', 'Réponse')).rejects.toMatchObject({
        status: 404,
        error: 'CONTACT_MESSAGE_NOT_FOUND',
      });

      expect(mail.sendReply).not.toHaveBeenCalled();
    });

    it('n\'appelle pas updateStatus si sendReply throw', async () => {
      repo.findById.mockResolvedValue(makeMsg());
      mail.sendReply.mockRejectedValue(new Error('SMTP error'));

      await expect(service.reply('msg-1', 'Réponse')).rejects.toThrow('SMTP error');

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });
});
