import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthProviderProps } from '../types/interfaces/AuthProviderProps.interface';
import { AuthContext, AuthContextType } from '../contexts/AuthContext'; 
import { User } from '@/types/interfaces/User.interface';

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
        const response = await fetch('/api/auth/register', {
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

  const confirmEmail = useCallback(
    async (token: string) => {
      setError(null);
      try {
        const response = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la confirmation');
        }

        // Mettre à jour l'utilisateur si besoin
        if (user) {
          setUser({ ...user, email_verified: true });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la confirmation';
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setError(null);
      try {
        const response = await fetch('/api/auth/login', {
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
        
        // Si 2FA requis, stocker l'ID temporairement
        if (data.requires2FA) {
          sessionStorage.setItem('pending_2fa_user_id', data.id);
          sessionStorage.setItem('pending_2fa_email', data.email);
          sessionStorage.setItem('pending_2fa_remember_me', rememberMe.toString());
          return; // Ne pas rediriger, laisse le composant faire
        }

        // Sinon, connecter directement
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          email_verified: data.email_verified,
          role: data.role,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la connexion';
        setError(message);
        throw err;
      }
    },
    []
  );

  const verify2FA = useCallback(
    async (userId: string, code: string) => {
      setError(null);
      try {
        const rememberMe = sessionStorage.getItem('pending_2fa_remember_me') === 'true';

        const response = await fetch('/api/auth/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: userId,
            code,
            remember_me: rememberMe,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la vérification');
        }

        const data = await response.json();

        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          email_verified: data.email_verified,
          role: data.role,
        });

        // Nettoyer sessionStorage
        sessionStorage.removeItem('pending_2fa_user_id');
        sessionStorage.removeItem('pending_2fa_email');
        sessionStorage.removeItem('pending_2fa_remember_me');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur vérification';
        setError(message);
        throw err;
      }
    },
    []
  );

  const verifyRememberMe = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/verify-remember-me', {
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
            role: data.role,
          });
        }
      }
    } catch (err) {
      console.error('Erreur vérification remember me:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
      setError(null);
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        console.error('Erreur lors de la déconnexion:', err);
      } finally {
        setUser(null);
      }
  }, []);

  const validateResetToken = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token?token=' + token, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      return false;
    } catch (error) {
      console.error('Erreur validation token:', error);
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur réinitialisation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur réinitialisation';
      setError(message);
      throw err;
    }
  }, []);

  const requestPasswordReset = useCallback(
    async (email: string) => {
      setError(null);
      try {
        const response = await fetch('/api/auth/request-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la demande');
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la demande';
        setError(message);
        throw err;
      }
    },
    []
  );

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
    confirmEmail,
    verify2FA,
    validateResetToken,
    resetPassword,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};