import React, { createContext, useCallback, useEffect, useState } from 'react';
import { User } from '../types/interfaces/User.interface';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  verifyRememberMe: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  confirmEmail: (token: string) => Promise<void>;
  verify2FA: (userId: string, code: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);