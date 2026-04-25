export interface IAuthRepository {
  findUserById(userId: string): Promise<{ id: string; email: string } | null>;
  findUserByIdAndToken(userId: string, refreshToken: string): Promise<{ id: string; email: string } | null>;
  findUserRole(userId: string): Promise<{ role: string } | null>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<unknown>;
}
