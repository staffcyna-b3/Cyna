import { IUserRepository } from '../interfaces/IUserRepository';
import { IUserService } from '../interfaces/IUserService';
import { PaginatedResponse } from '../dto/PaginatedResponse';
import { UserAdminDTO } from '../dto/UserAdminDTO';
import { UserRoleType } from '../enum/UserRoleType';
import { toUserAdminDTO } from '../dto/mapper/UserMapper';

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) {}

  async getAll(page: number, limit: number): Promise<PaginatedResponse<UserAdminDTO>> {
    const { rows, count } = await this.repo.findAll(page, limit);
    return {
      data: rows.map((u) => toUserAdminDTO(u)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getById(id: string): Promise<UserAdminDTO> {
    const user = await this.repo.findById(id);
    if (!user) throw { status: 404, error: 'USER_NOT_FOUND' };
    return toUserAdminDTO(user);
  }

  async updateRole(id: string, role: string): Promise<UserAdminDTO> {
    const validRoles = Object.values(UserRoleType);
    if (!validRoles.includes(role as UserRoleType)) {
      throw { status: 400, error: 'INVALID_ROLE' };
    }
    const user = await this.repo.updateRole(id, role);
    return toUserAdminDTO(user);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
