import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type { IMailService } from '../interfaces/IMailService';
import type { IPendingAuthStore } from '../interfaces/IPendingAuthStore';
import type { IAuthRepository } from '../interfaces/IAuthRepository';

const makeUserRepo = (): IUserRepository & Record<string, ReturnType<typeof vi.fn>> => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  findByIdWithRole: vi.fn(),
  findByRememberToken: vi.fn(),
  create: vi.fn(),
  updateRememberToken: vi.fn(),
  clearRememberToken: vi.fn(),
  updateEmailConfirmationToken: vi.fn(),
  confirmEmailByToken: vi.fn(),
  updatePasswordResetToken: vi.fn(),
  findByPasswordResetToken: vi.fn(),
  updatePassword: vi.fn(),
  update2FACode: vi.fn(),
  clear2FACode: vi.fn(),
  updateProfile: vi.fn(),
}) as unknown as IUserRepository & Record<string, ReturnType<typeof vi.fn>>;

const makeMailService = (): IMailService => ({
  sendConfirmationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  send2FACode: vi.fn(),
  sendOrderConfirmationEmail: vi.fn(),
});

const makePendingStore = (): IPendingAuthStore => ({
  create: vi.fn(),
  get: vi.fn(),
  clear: vi.fn(),
  incrementAttempts: vi.fn(),
});

const makeJwtRepo = (): IAuthRepository => ({
  findUserById: vi.fn(),
  findUserByIdAndToken: vi.fn(),
  findUserRole: vi.fn(),
  updateRefreshToken: vi.fn(),
});

describe('AuthService — profil', () => {
  let userRepo: ReturnType<typeof makeUserRepo>;
  let service: AuthService;

  beforeEach(() => {
    userRepo = makeUserRepo();
    service = new AuthService(
      userRepo,
      makeMailService(),
      makePendingStore(),
      makeJwtRepo(),
    );
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('retourne id, email, full_name — password absent', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        password: '$2b$10$hashed',
      });

      const result = await service.getProfile('user-123');

      expect(result).toEqual({ id: 'user-123', email: 'test@example.com', full_name: 'Test User' });
      expect(result).not.toHaveProperty('password');
    });

    it('lève une erreur si user introuvable', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.getProfile('inexistant')).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('updateProfile', () => {
    it('rejet si email déjà pris par un autre user', async () => {
      userRepo.findByEmail.mockResolvedValue({ id: 'autre-user', email: 'taken@example.com' });

      await expect(
        service.updateProfile('user-123', { email: 'taken@example.com' }),
      ).rejects.toThrow('Email déjà utilisé');
    });

    it('succès si email identique au user courant', async () => {
      userRepo.findByEmail.mockResolvedValue({ id: 'user-123', email: 'same@example.com' });
      userRepo.updateProfile.mockResolvedValue({
        id: 'user-123',
        email: 'same@example.com',
        full_name: 'Nouveau Nom',
      });

      const result = await service.updateProfile('user-123', {
        email: 'same@example.com',
        full_name: 'Nouveau Nom',
      });

      expect(result).toEqual({ id: 'user-123', email: 'same@example.com', full_name: 'Nouveau Nom' });
      expect(result).not.toHaveProperty('password');
    });

    it('met à jour sans email sans appeler findByEmail', async () => {
      userRepo.updateProfile.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Nouveau Nom',
      });

      await service.updateProfile('user-123', { full_name: 'Nouveau Nom' });

      expect(userRepo.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('rejet si current_password incorrect', async () => {
      userRepo.findById.mockResolvedValue({
        id: 'user-123',
        password: await bcrypt.hash('correct-password', 10),
      });

      await expect(
        service.changePassword('user-123', 'wrong-password', 'new-password'),
      ).rejects.toThrow('Mot de passe actuel incorrect');
    });

    it('nouveau password bien haché avant sauvegarde', async () => {
      const hashedCurrent = await bcrypt.hash('current-password', 10);
      userRepo.findById.mockResolvedValue({ id: 'user-123', password: hashedCurrent });
      userRepo.updatePassword.mockResolvedValue(undefined);

      await service.changePassword('user-123', 'current-password', 'new-password-123');

      expect(userRepo.updatePassword).toHaveBeenCalledTimes(1);
      const savedPassword = userRepo.updatePassword.mock.calls[0][1];
      expect(savedPassword).not.toBe('new-password-123');
      expect(await bcrypt.compare('new-password-123', savedPassword)).toBe(true);
    });

    it('lève une erreur si user introuvable', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('inexistant', 'current', 'new'),
      ).rejects.toThrow('Utilisateur non trouvé');
    });
  });
});
