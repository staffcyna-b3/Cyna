export interface LoginResult {
  sessionId: string;
  requires2FA: boolean;
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
  logout(token: string): Promise<void>;
  verifyRememberToken(token: string): Promise<AuthenticatedUserResult>;
}
