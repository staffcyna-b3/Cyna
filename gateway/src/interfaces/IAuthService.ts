export interface LoginResult {
  requires2FA: boolean;
  sessionId?: string;
  user?: AuthenticatedUserResult;
  rememberToken?: string | null;
}

export interface Verify2FAResult {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  role?: string;
  rememberToken: string | null;
}

export interface AuthenticatedUserResult {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  role?: string;
}

export interface IAuthService {
  login(email: string, password: string, rememberMe: boolean): Promise<LoginResult>;
  verify2FA(sessionId: string, code: string): Promise<Verify2FAResult>;
  register(email: string, password: string, full_name: string): Promise<AuthenticatedUserResult>;
  confirmEmail(token: string): Promise<{ message: string }>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  validateResetToken(token: string): Promise<{ valid: boolean }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
  logout(rememberMeToken?: string, refreshToken?: string): Promise<void>;
  verifyRememberToken(token: string): Promise<AuthenticatedUserResult>;
  generateTokensForUser(userId: string): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
  getProfile(userId: string): Promise<{ id: string; email: string; full_name: string }>;
  updateProfile(userId: string, data: { full_name?: string; email?: string }): Promise<{ id: string; email: string; full_name: string }>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
