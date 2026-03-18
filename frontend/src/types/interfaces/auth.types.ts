export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RequestResetFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  role: 'ADMIN' | 'COMMERCIAL' | 'USER';
}