import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MailService } from '../../services/mail.service';

const sendMailMock = vi.fn().mockResolvedValue(undefined);

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}));

const baseOptions = {
  to: 'user@example.com',
  subject: 'Problème de connexion',
  replyMessage: 'Voici notre réponse.',
  originalMessage: 'Je ne peux pas me connecter.',
};

describe('MailService (back-office)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendReply — non configuré', () => {
    it('ne throw pas si EMAIL_USER absent', async () => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;

      const service = new MailService();

      await expect(service.sendReply(baseOptions)).resolves.toBeUndefined();
    });
  });

  describe('sendReply — configuré', () => {
    beforeEach(() => {
      process.env.EMAIL_USER = 'support@cyna.com';
      process.env.EMAIL_PASSWORD = 'secret';
    });

    afterEach(() => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
    });

    it('préfixe Re: si absent du sujet', async () => {
      const service = new MailService();
      await service.sendReply({ ...baseOptions, subject: 'Problème de connexion' });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Re: Problème de connexion' })
      );
    });

    it('ne double pas Re: si déjà présent', async () => {
      const service = new MailService();
      await service.sendReply({ ...baseOptions, subject: 'Re: Problème de connexion' });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Re: Problème de connexion' })
      );
    });

    it('envoie vers l\'adresse email du message original', async () => {
      const service = new MailService();
      await service.sendReply(baseOptions);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'user@example.com' })
      );
    });
  });
});
