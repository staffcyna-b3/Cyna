export interface PendingAuthSession {
  sessionId: string;
  userId: string;
  email: string;
  rememberMe: boolean;
  expiresAt: Date;
  attempts: number;
}

export interface IPendingAuthStore {
  create(userId: string, email: string, rememberMe: boolean): string;
  get(sessionId: string): PendingAuthSession | null;
  incrementAttempts(sessionId: string): boolean;
  clear(sessionId: string): void;
}
