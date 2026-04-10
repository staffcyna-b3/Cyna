import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { AuthProviderProps } from '../types/interfaces/AuthProviderProps.interface';
import { AuthContext, AuthContextType } from '../contexts/AuthContext'; 
import { User } from '@/types/interfaces/User.interface';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedRememberMe = useRef(false);

  const clearError = useCallback(() => setError(null), []);

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

        // Stocker SEULEMENT le sessionId (pas d'infos utilisateur)
        if (data.requires2FA) {
          sessionStorage.setItem('pending_2fa_session_id', data.sessionId);
          sessionStorage.setItem('pending_2fa_remember_me', rememberMe.toString());
        } else {
          // Si pas de 2FA, connecter directement (rare mais possible)
          setAccessToken(data.accessToken ?? null);
          setUser({
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            email_verified: data.email_verified,
            role: data.role,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la connexion';
        setError(message);
        throw err;
      }
    },
    []
  );

  const verify2FA = useCallback(
    async (sessionId: string, code: string) => {
      setError(null);
      try {
        const rememberMe = sessionStorage.getItem('pending_2fa_remember_me') === 'true';
        const response = await fetch('/api/auth/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            session_id: sessionId,
            code,
            remember_me: rememberMe,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la vérification');
        }

        const data = await response.json();
        const userData = data?.data?.user;

        if (!userData) {
          throw new Error('Données utilisateur manquantes après vérification 2FA');
        }

        setAccessToken(data.data.accessToken ?? null);
        setUser({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          email_verified: userData.email_verified,
          role: userData.role,
        });

        // Nettoyer sessionStorage après connexion réussie
        sessionStorage.removeItem('pending_2fa_session_id');
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
    }
  }, []);

  // Au chargement initial : tenter le refresh JWT, sinon fallback sur remember-me
  useEffect(() => {
    if (hasCheckedRememberMe.current) return;
    hasCheckedRememberMe.current = true;

    const initAuth = async () => {
      try {
        // 1. Tenter de rafraîchir l'accessToken via le refreshToken cookie
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const token = refreshData.data?.accessToken;

          if (token) {
            // 2. Récupérer les infos utilisateur avec le nouvel accessToken
            const meResponse = await fetch('/api/auth/me', {
              credentials: 'include',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (meResponse.ok) {
              const meData = await meResponse.json();
              const userData = meData.data?.user;
              if (userData) {
                setAccessToken(token);
                setUser({
                  id: userData.id,
                  email: userData.email,
                  full_name: userData.full_name,
                  email_verified: userData.email_verified,
                  role: userData.role,
                });
                return;
              }
            }
          }
        }

        // 3. Fallback : vérifier le cookie remember-me
        await verifyRememberMe();
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
        await verifyRememberMe();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [verifyRememberMe]);

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
        setAccessToken(null);
      }
  }, []);

  const validateResetToken = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
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
    accessToken,
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