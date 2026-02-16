import { create } from "domain";
import React, { createContext, useCallback, useEffect, useState } from "react";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const clearError = useCallback(() => setError(null), []);

    // Au chargement, vérifier si l'utilisateur est déjà connecté
    useEffect(() => {
        const initializeAuth = async () => {
            // Récupérer le token depuis les cookies
            const token = document.cookie.split('; ').find(row => row.startsWith('token='));
            if (token) {
                try {
                    const response = await fetch('/api/front-office/auth/me', {
                        headers: {
                            Authorization: `Bearer ${token.split('=')[1]}`,
                        },
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        setError("Failed to retrieve user data");
                    }
                } catch (err) {
                    setError("Error retrieving user data");
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const register = useCallback(
        async (email: string, password: string, full_name: string) => {
            setError(null);
            try {
                const response = await fetch('/api/front-office/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, full_name }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Registration failed');
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(message);
                throw err;
            }
        },
        []    
    );

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            const response = await fetch('/api/front-office/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            // Stocker les tokens dans les cookies
            document.cookie = `token=${data.token}; path=/; secure; HttpOnly`;
            if (data.refresh_token) {
                document.cookie = `refresh_token=${data.refresh_token}; path=/; secure; HttpOnly`;
            }

            // Mettre à jour l'état de l'utilisateur
            setUser({
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                email_verified: data.email_verified
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(message);
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        setError(null);
        try {
            const accessToken = document.cookie.split('; ').find(row => row.startsWith('token='));
            if (accessToken) {
                await fetch('/api/front-office/auth/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken.split('=')[1]}` },
                });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Supprimer les cookies
            setUser(null);
        }
    }, []);

    const confirmEmail = useCallback(async (token: string) => {
        setError(null);
        try {
            const response = await fetch('/api/front-office/auth/confirm-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Email confirmation failed');
            }

            // Mettre à jour l'état de l'utilisateur après confirmation
            if (user) {
                setUser({ ...user, email_verified: true });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(message);
            throw err;
        }
    }, [user]);

    const requestPasswordReset = useCallback(async (email: string) => {
        setError(null);
        try {
            const response = await fetch('/api/front-office/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password reset request failed');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(message);
            throw err;
        }
    }, []);

    const resetPassword = useCallback(async (token: string, newPassword: string) => {
        setError(null);
        try {
            const response = await fetch('/api/front-office/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Password reset failed');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(message);
            throw err;
        }
    }, []);

    const validateResetToken = useCallback(async (token: string): Promise<boolean> => {
        setError(null);
        try {
            const response = await fetch('/api/front-office/auth/validate-reset-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.valid === true;
        } catch (err) {
            return false;
        }
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        confirmEmail,
        requestPasswordReset,
        resetPassword,
        validateResetToken,
        error,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}