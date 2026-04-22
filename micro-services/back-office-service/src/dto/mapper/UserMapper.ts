import { UserAdminDTO } from '../UserAdminDTO';
import { UserWithRoles } from '../../interfaces/IUserRepository';
import { UserRoleType } from '../../enum/UserRoleType';

export function toUserAdminDTO(user: UserWithRoles): UserAdminDTO {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.roles?.[0]?.role ?? UserRoleType.USER,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
}
