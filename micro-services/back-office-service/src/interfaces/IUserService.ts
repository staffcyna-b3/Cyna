import { PaginatedResponse } from '../dto/PaginatedResponse';
import { UserAdminDTO } from '../dto/UserAdminDTO';

export interface IUserService {
  getAll(page: number, limit: number): Promise<PaginatedResponse<UserAdminDTO>>;
  getById(id: string): Promise<UserAdminDTO>;
}
