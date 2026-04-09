export interface AuthUserRole {
  role: string;
}

export interface AuthUserEntity {
  id: string;
  email: string;
  full_name: string;
  password: string;
  email_verified: boolean;
  remember_me_token?: string | null;
  twofa_code?: string | null;
  twofa_expires_at?: Date | null;
  userRole?: AuthUserRole;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<AuthUserEntity | null>;
  findByIdWithRole(userId: string): Promise<AuthUserEntity | null>;
  findByRememberToken(tokenHash: string): Promise<AuthUserEntity | null>;
  create(email: string, password: string, full_name: string): Promise<AuthUserEntity>;
  updateRememberToken(userId: string, tokenHash: string): Promise<void>;
  clearRememberToken(tokenHash: string): Promise<void>;
  updateEmailConfirmationToken(userId: string, tokenHash: string): Promise<void>;
  confirmEmailByToken(tokenHash: string): Promise<AuthUserEntity | null>;
  updatePasswordResetToken(userId: string, tokenHash: string): Promise<void>;
  findByPasswordResetToken(tokenHash: string): Promise<AuthUserEntity | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  update2FACode(userId: string, code: string, expiresAt: Date): Promise<void>;
  clear2FACode(userId: string): Promise<void>;
}
