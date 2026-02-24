import React, { createContext, useCallback, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  verifyRememberMe: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Au chargement initial, vérifier le remember me token
  useEffect(() => {
    verifyRememberMe();
  }, []);

  const register = useCallback(
    async (email: string, password: string, full_name: string) => {
      setError(null);
      try {
        const response = await fetch('/api/front-office/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, full_name }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'inscription');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
        setError(message);
        throw err;
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setError(null);
      try {
        const response = await fetch('/api/front-office/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
            remember_me: rememberMe,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la connexion');
        }

        const data = await response.json();
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          email_verified: data.email_verified,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la connexion';
        setError(message);
        throw err;
      }
    },
    []
  );

  const verifyRememberMe = useCallback(async () => {
    try {
      const response = await fetch('/api/front-office/auth/verify-remember-me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser({
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            email_verified: data.email_verified,
          });
        }
      }
    } catch (err) {
      console.error('Erreur verify remember me:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await fetch('/api/front-office/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    verifyRememberMe,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};