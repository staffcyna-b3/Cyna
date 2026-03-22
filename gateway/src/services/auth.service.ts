import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Logger } from '../common/logger';
import { hashToken, verifyToken } from '../utils/token.utils';
import { IAuthService, IMailService, IPendingAuthStore, IUserRepository } from '../interfaces';
import { AuthRepository } from '../repository/auth.repository';
import { JwtPayloadDto } from '../dto/JwtPayloadDto';

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailService: IMailService,
    private readonly pendingAuthStore: IPendingAuthStore,
  ) {}

  private jwtRepository = new AuthRepository();

  private generate2FACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Code à 6 chiffres
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ===== 2FA + tokens spécifiques =====
  async login(email: string, password: string, rememberMe: boolean) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!user.email_verified) {
        throw new Error('Email non confirmé');
      }

      const twoFAFlag = (user as any).twofa_enabled;
      const twoFAEnabled = twoFAFlag === undefined || twoFAFlag === null
        ? true
        : Boolean(twoFAFlag);

      if (!twoFAEnabled) {
        let rememberToken: string | null = null;
        if (rememberMe) {
          rememberToken = this.generateSecureToken();
          const rememberTokenHash = hashToken(rememberToken);
          await this.userRepository.updateRememberToken(user.id, rememberTokenHash);
        }

        return {
          requires2FA: false,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            email_verified: user.email_verified,
            role: user.userRole?.role,
          },
          rememberToken,
        };
      }

      const code = this.generate2FACode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await this.userRepository.update2FACode(user.id, code, expiresAt);
      await this.mailService.send2FACode(user.email, code);

      const sessionId = this.pendingAuthStore.create(user.id, user.email, rememberMe);

      return {
        sessionId,
        requires2FA: true,
      };
    } catch (error) {
      Logger.error('Auth login error:', error);
      throw error;
    }
  }

  async verify2FA(sessionId: string, code: string) {
    try {
      const session = this.pendingAuthStore.get(sessionId);
      
      if (!session) {
        throw new Error('Session 2FA invalide ou expirée');
      }

      const user = await this.userRepository.findByIdWithRole(session.userId);

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (!user.twofa_expires_at || user.twofa_expires_at < new Date()) {
        throw new Error('Code expiré');
      }

      if (user.twofa_code !== code) {
        const hasAttemptsRemaining = this.pendingAuthStore.incrementAttempts(sessionId);
        if (!hasAttemptsRemaining) {
          throw new Error('Trop de tentatives. Demandez un nouveau code.');
        }
        throw new Error('Code incorrect');
      }

      this.pendingAuthStore.clear(sessionId);
      await this.userRepository.clear2FACode(session.userId);

      let rememberToken = null;
      if (session.rememberMe) {
        rememberToken = this.generateSecureToken();
        const rememberTokenHash = hashToken(rememberToken);
        await this.userRepository.updateRememberToken(user.id, rememberTokenHash);
      }

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.email_verified,
        role: user.userRole?.role,
        rememberToken,
      };
    } catch (error) {
      Logger.error('Auth verify 2FA error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, full_name: string) {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Email déjà utilisé');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.userRepository.create(email, hashedPassword, full_name);

      const confirmationToken = this.generateSecureToken();
      const confirmationTokenHash = hashToken(confirmationToken);
      await this.userRepository.updateEmailConfirmationToken(user.id, confirmationTokenHash);
      await this.mailService.sendConfirmationEmail(email, confirmationToken);

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.email_verified,
      };
    } catch (error) {
      Logger.error('Auth register error:', error);
      throw error;
    }
  }

  async confirmEmail(token: string) {
    try {
      const tokenHash = hashToken(token);
      const user = await this.userRepository.confirmEmailByToken(tokenHash);

      if (!user) {
        throw new Error('Token invalide');
      }

      return {
        message: 'Email confirmé avec succès',
      };
    } catch (error) {
      Logger.error('Auth confirm email error:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return {
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
        };
      }

      const resetToken = this.generateSecureToken();
      const resetTokenHash = hashToken(resetToken);
      await this.userRepository.updatePasswordResetToken(user.id, resetTokenHash);
      await this.mailService.sendPasswordResetEmail(email, resetToken);

      return {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    } catch (error) {
      Logger.error('Auth request password reset error:', error);
      throw error;
    }
  }

  async validateResetToken(token: string) {
    try {
      const tokenHash = hashToken(token);
      const user = await this.userRepository.findByPasswordResetToken(tokenHash);
      
      if (!user) {
        return { valid: false };
      }

      return { valid: true };
    } catch (error) {
      Logger.error('Auth validate reset token error:', error);
      return { valid: false };
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const tokenHash = hashToken(token);
      const user = await this.userRepository.findByPasswordResetToken(tokenHash);

      if (!user) {
        throw new Error('Token invalide');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.updatePassword(user.id, hashedPassword);

      return {
        message: 'Mot de passe réinitialisé avec succès',
      };
    } catch (error) {
      Logger.error('Auth reset password error:', error);
      throw error;
    }
  }

  async logout(token: string) {
    try {
      const tokenHash = hashToken(token);
      await this.userRepository.clearRememberToken(tokenHash);
    } catch (error) {
      Logger.error('Auth logout error:', error);
      throw error;
    }
  }

  async verifyRememberToken(token: string) {
    try {
      const tokenHash = hashToken(token);
      const user = await this.userRepository.findByRememberToken(tokenHash);

      if (!user) {
        throw new Error('Token invalide');
      }

      if (!user.remember_me_token || !verifyToken(token, user.remember_me_token)) {
        throw new Error('Token invalide');
      }

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.email_verified,
        role: user.userRole?.role,
      };
    } catch (error) {
      Logger.error('Auth verify remember token error:', error);
      throw error;
    }
  }

  // ===== JWT - généré après 2FA =====
  async generateTokensForUser(userId: string) {
    try {
      const user = await this.jwtRepository.findUserById(userId);

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const role = await this.jwtRepository.findUserRole(userId);

      const payload: JwtPayloadDto = {
        userId: user.id,
        email: user.email,
        role: role?.role as string,
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      // const refreshToken = jwt.sign(
      //   payload,
      //   process.env.JWT_REFRESH_SECRET!,
      //   { expiresIn: '7d' }
      // );

      const refreshToken = this.generateSecureToken();
      await this.jwtRepository.updateRefreshToken(userId, refreshToken);

      return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
    } catch (error) {
      Logger.error('Auth generate tokens error:', error);
      throw error;
    }
  }

  async refresh(refreshToken: string) {
    try {
      let decoded: JwtPayloadDto;

      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayloadDto;
      } catch (error) {
        throw new Error('Refresh token expiré ou invalide');
      }

      const user = await this.jwtRepository.findUserByIdAndToken(decoded.userId, refreshToken);

      if (!user) {
        throw new Error('Refresh token invalide');
      }

      const role = await this.jwtRepository.findUserRole(user.id);

      const payload: JwtPayloadDto = {
        userId: user.id,
        email: user.email,
        role: role?.role as string,
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      return { accessToken };
    } catch (error) {
      Logger.error('Auth refresh error:', error);
      throw error;
    }
  }
}