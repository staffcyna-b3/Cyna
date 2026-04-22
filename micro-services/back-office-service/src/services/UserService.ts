import { IUserRepository } from '../interfaces/IUserRepository';
import { IUserService } from '../interfaces/IUserService';
import { PaginatedResponse } from '../dto/PaginatedResponse';
import { UserAdminDTO } from '../dto/UserAdminDTO';
import { UserRoleType } from '../enum/UserRoleType';

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) {}

  async getAll(page: number, limit: number): Promise<PaginatedResponse<UserAdminDTO>> {
    const { rows, count } = await this.repo.findAll(page, limit);
    return {
      data: rows.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.roles?.[0]?.role ?? UserRoleType.USER,
        created_at: u.created_at.toISOString(),
        updated_at: u.updated_at.toISOString(),
      })),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getById(id: string): Promise<UserAdminDTO> {
    const user = await this.repo.findById(id);
    if (!user) throw { status: 404, error: 'USER_NOT_FOUND' };
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.roles?.[0]?.role ?? UserRoleType.USER,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };
  }
}
