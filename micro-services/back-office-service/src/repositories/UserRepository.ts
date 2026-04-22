import User from '../models/User';
import UserRole from '../models/UserRole';
import { IUserRepository, UserWithRoles } from '../interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  async findAll(page: number, limit: number): Promise<{ rows: UserWithRoles[]; count: number }> {
    const offset = (page - 1) * limit;
    const result = await User.findAndCountAll({
      attributes: ['id', 'full_name', 'email', 'created_at', 'updated_at'],
      include: [{ model: UserRole, as: 'roles', attributes: ['role'] }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });
    return result as unknown as { rows: UserWithRoles[]; count: number };
  }

  async findById(id: string): Promise<UserWithRoles | null> {
    const user = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'created_at', 'updated_at'],
      include: [{ model: UserRole, as: 'roles', attributes: ['role'] }],
    });
    return user as UserWithRoles | null;
  }
}
