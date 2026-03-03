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
}