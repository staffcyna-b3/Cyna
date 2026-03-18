import User from '../models/User';
import UserRole from '../models/UserRole';
import { UserRoleType } from '../enum/UserRoleType.enum';

export class UserRepository {
  async findByEmail(email: string) {
    return await User.findOne({
      where: { email },
      include: [{ association: 'userRole', attributes: ['role'] }],
    });
  }

  async findByIdWithRole(userId: string) {
    return await User.findByPk(userId, {
      include: [{ association: 'userRole', attributes: ['role'] }],
    });
  }

  async findByRememberToken(token: string) {
    return await User.findOne({
      where: { remember_me_token: token },
      include: [{ association: 'userRole', attributes: ['role'] }],
    });
  }

  async create(email: string, password: string, full_name: string) {
    const user = await User.create({
      email,
      password,
      full_name,
      email_verified: false,
    });

    // Créer le rôle associé
    await UserRole.create({
      user_id: user.id,
      role: UserRoleType.USER,
    });

    return user;
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

  async updateEmailConfirmationToken(userId: string, token: string) {
    return await User.update(
      { email_confirmation_token: token },
      { where: { id: userId } }
    );
  }

  async findByEmailConfirmationToken(token: string) {
    return await User.findOne({
      where: { email_confirmation_token: token },
    });
  }

  async confirmEmailByToken(token: string) {
    const user = await this.findByEmailConfirmationToken(token);
    
    if (user) {
      user.email_verified = true;
      user.email_confirmed_at = new Date();
      user.email_confirmation_token = null;
      await user.save();
    }

    return user;
  }

  async updatePasswordResetToken(userId: string, token: string) {
    return await User.update(
      { password_reset_token: token },
      { where: { id: userId } }
    );
  }

  async findByPasswordResetToken(token: string) {
    return await User.findOne({
      where: { password_reset_token: token },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return await User.update(
      {
        password: hashedPassword,
        password_reset_token: null,
      },
      { where: { id: userId } }
    );
  }

  async update2FACode(userId: string, code: string, expiresAt: Date) {
    return await User.update(
      {
        twofa_code: code,
        twofa_expires_at: expiresAt,
        twofa_attempts: 0,
      },
      { where: { id: userId } }
    );
  }

  async increment2FAAttempts(userId: string) {
    return await User.increment('twofa_attempts', {
      where: { id: userId },
    });
  }

  async clear2FACode(userId: string) {
    return await User.update(
      {
        twofa_code: null,
        twofa_expires_at: null,
        twofa_attempts: 0,
      },
      { where: { id: userId } }
    );
  }
}