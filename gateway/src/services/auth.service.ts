import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repository/user.repository';
import { MailService } from './mail.service';
import { Logger } from '../common/logger';

export class AuthService {
  private userRepository = new UserRepository();
  private mailService = new MailService();

  private generate2FACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Code à 6 chiffres
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async login(email: string, password: string, rememberMe: boolean) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier l'email confirmé
      if (!user.email_verified) {
        throw new Error('Email non confirmé');
      }

      // Générer et envoyer le code 2FA
      const code = this.generate2FACode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      await this.userRepository.update2FACode(user.id, code, expiresAt);
      await this.mailService.send2FACode(user.email, code);

      // Retourner l'ID pour la vérification 2FA
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        requires2FA: true,
        rememberMe,
      };
    } catch (error) {
      Logger.error('Auth login error:', error);
      throw error;
    }
  }

  async verify2FA(userId: string, code: string, rememberMe: boolean) {
    try {
      const user = await this.userRepository.findByIdWithRole(userId);

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier l'expiration du code
      if (!user.twofa_expires_at || user.twofa_expires_at < new Date()) {
        throw new Error('Code expiré');
      }

      // Vérifier le nombre de tentatives (max 3)
      if (user.twofa_attempts && user.twofa_attempts >= 3) {
        throw new Error('Trop de tentatives. Demandez un nouveau code.');
      }

      // Vérifier le code
      if (user.twofa_code !== code) {
        await this.userRepository.increment2FAAttempts(userId);
        throw new Error('Code incorrect');
      }

      await this.userRepository.clear2FACode(userId);

      // Si remember me, générer le token
      let rememberToken = null;
      if (rememberMe) {
        rememberToken = this.generateSecureToken();
        await this.userRepository.updateRememberToken(user.id, rememberToken);
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

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userRepository.create(email, hashedPassword, full_name);

      // Générer et envoyer le token de confirmation
      const confirmationToken = this.generateSecureToken();
      await this.userRepository.updateEmailConfirmationToken(user.id, confirmationToken);
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
      const user = await this.userRepository.confirmEmailByToken(token);

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

      // Générer le token de reset (valide 1 heure)
      const resetToken = this.generateSecureToken();
      await this.userRepository.updatePasswordResetToken(user.id, resetToken);

      // Envoyer l'email
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
      const user = await this.userRepository.findByPasswordResetToken(token);
      
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
      const user = await this.userRepository.findByPasswordResetToken(token);

      if (!user) {
        throw new Error('Token invalide');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour en BDD
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
      await this.userRepository.clearRememberToken(token);
    } catch (error) {
      Logger.error('Auth logout error:', error);
      throw error;
    }
  }

  async verifyRememberToken(token: string) {
    try {
      const user = await this.userRepository.findByRememberToken(token);

      if (!user) {
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
}