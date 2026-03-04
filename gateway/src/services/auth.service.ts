import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repository/user.repository';
import { Logger } from '../common/logger';
import { MailService } from './mail.service';

export class AuthService {
  private userRepository = new UserRepository();
  private mailService = new MailService();

  async login(email: string, password: string, rememberMe: boolean) {
    try {
      // Chercher l'utilisateur
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier email confirmé
      if (!user.email_verified) {
        throw new Error('Email non confirmé');
      }

      // Si remember me, générer token
      let rememberToken = null;
      if (rememberMe) {
        rememberToken = crypto.randomBytes(32).toString('hex');
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
      Logger.error('Auth login error:', error);
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
      Logger.error('Auth verify remember me error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, full_name: string) {
    try {
        // Vérifier que l'email n'existe pas
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
          throw new Error('Email déjà utilisé');
        }

        // Créer l'utilisateur (password sera hashé dans le repository)
        const user = await this.userRepository.create(email, password, full_name);

        const confirmationToken = crypto.randomBytes(32).toString('hex');
        await this.userRepository.updateEmailConfirmationToken(user.id, confirmationToken);

        // ✅ Envoyer email
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
        // Utiliser la méthode du repository qui cherche par token
        await this.userRepository.confirmEmail(token);

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

      // ✅ Important: Ne pas dire si l'email existe (sécurité)
      if (!user) {
        return {
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
        };
      }

      // Générer token reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      await this.userRepository.updatePasswordResetToken(user.id, resetToken);

      // Envoyer email
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
      const isValid = await this.userRepository.validateResetToken(token);
      return { valid: isValid };
    } catch (error) {
      Logger.error('Auth validate reset token error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      await this.userRepository.resetPassword(token, newPassword);
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
}