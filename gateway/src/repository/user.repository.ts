import User from '../models/User';
import UserRole from '../models/UserRole';
import bcrypt from 'bcrypt';
import { UserRoleType } from '../enum/UserRoleType.enum';

export class UserRepository {
  async findByEmail(email: string) {
    return await User.findOne({
      where: { email },
      include: [{ association: 'userRole', attributes: ['role'] }],
    });
  }

  async updatePasswordResetToken(userId: string, token: string) {
    return await User.update(
      { password_reset_token: token },
      { where: { id: userId } }
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      where: { password_reset_token: token },
    });

    if (!user) {
      throw new Error('Token invalide');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.password_reset_token = null;
    await user.save();

    return user;
  }

  async validateResetToken(token: string) {
    const user = await User.findOne({
      where: { password_reset_token: token },
    });

    return !!user;
  }

  async confirmEmail(token: string) {
    const user = await User.findOne({
      where: { email_confirmation_token: token },
    });

    if (!user) {
      throw new Error('Token invalide');
    }

    user.email_verified = true;
    user.email_confirmed_at = new Date();
    user.email_confirmation_token = null;
    await user.save();

    return user;
  }

  async updateEmailConfirmationToken(userId: string, token: string) {
    return await User.update(
      { email_confirmation_token: token },
      { where: { id: userId } }
    );
  }

  async findByRememberToken(token: string) {
    return await User.findOne({
      where: { remember_me_token: token },
      include: [{ association: 'userRole', attributes: ['role'] }],
    });
  }

  async create(email: string, password: string, full_name: string) {
    try {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await User.create({
        email,
        password: hashedPassword,
        full_name,
        email_verified: false,
      });

      // Créer le rôle associé
      await UserRole.create({
        user_id: user.id,
        role: UserRoleType.USER,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateRememberToken(userId: string, token: string) {
    return await User.update(
      { remember_me_token: token },
      { where: { id: userId } }
    );
  }

  async clearRememberToken(token: string) {
    return await User.update(
      { remember_me_token: null },
      { where: { remember_me_token: token } }
    );
  }

  async generateAndSend2FACode(userId: string, email: string) {
    // Générer code 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await User.update(
      {
        twofa_code: code,
        twofa_expires_at: expiresAt,
        twofa_attempts: 0,
      },
      { where: { id: userId } }
    );

    return code; // Pour envoyer par mail
  }

  async verify2FACode(userId: string, code: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier expiration
    if (!user.twofa_expires_at || user.twofa_expires_at < new Date()) {
      throw new Error('Code expiré');
    }

    // Vérifier tentatives
    if ((user.twofa_attempts ?? 0) >= 3) {
      throw new Error('Trop de tentatives. Demandez un nouveau code.');
    }

    // Vérifier le code
    if (user.twofa_code !== code) {
      await User.update(
        { twofa_attempts: (user.twofa_attempts ?? 0) + 1 },
        { where: { id: userId } }
      );
      throw new Error('Code incorrect');
    }

    // Succès - nettoyer le code
    await User.update(
      {
        twofa_code: null,
        twofa_expires_at: null,
        twofa_attempts: 0,
      },
      { where: { id: userId } }
    );

    return true;
  }

  async findByIdWithRole(userId: string) {
    return await User.findByPk(userId, {
      include: [{ association: 'userRole', attributes: ['role'] }],
    });
  }
}