import User from '../models/User';
import UserRole from '../models/UserRole';

export type UserWithRoles = User & { roles?: UserRole[] };

export interface IUserRepository {
  findAll(page: number, limit: number): Promise<{ rows: UserWithRoles[]; count: number }>;
  findById(id: string): Promise<UserWithRoles | null>;
}
