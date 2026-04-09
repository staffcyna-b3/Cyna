import crypto from 'crypto';
import { Logger } from '../common/logger';
import { IPendingAuthStore } from '../interfaces';

/**
 * Données stockées pour une authentification 2FA en attente
 * Jamais envoyées au client en clair
 */
export interface PendingAuth2FA {
  sessionId: string;
  userId: string;
  email: string;
  rememberMe: boolean;
  expiresAt: Date;
  attempts: number;
}

export class PendingAuth2FAStore implements IPendingAuthStore {
  private sessions = new Map<string, PendingAuth2FA>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Lancer le nettoyage automatique toutes les minutes
    this.startCleanupJob();
  }

  create(userId: string, email: string, rememberMe: boolean): string {
    const sessionId = crypto.randomUUID();
    
    const session: PendingAuth2FA = {
      sessionId,
      userId,
      email,
      rememberMe,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
    };

    this.sessions.set(sessionId, session);
    Logger.info(`[2FA] Session créée: ${sessionId} pour utilisateur ${userId}`);

    return sessionId;
  }

  /**
   * Récupère une session si elle existe et n'a pas expiré
   */
  get(sessionId: string): PendingAuth2FA | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      Logger.warn(`[2FA] Session introuvable: ${sessionId}`);
      return null;
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      Logger.warn(`[2FA] Session expirée: ${sessionId}`);
      return null;
    }

    return session;
  }

  /**
   * Incrémente le nombre de tentatives
   * @returns true si encore des tentatives disponibles, false sinon
   */
  incrementAttempts(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    session.attempts++;
    Logger.info(`[2FA] Tentative échouée pour ${sessionId}: ${session.attempts}/3`);

    if (session.attempts >= 3) {
      this.sessions.delete(sessionId);
      Logger.warn(`[2FA] Session supprimée après 3 tentatives: ${sessionId}`);
      return false;
    }

    return true;
  }

  /**
   * Supprime une session après vérification réussie
   */
  clear(sessionId: string): void {
    this.sessions.delete(sessionId);
    Logger.info(`[2FA] Session supprimée: ${sessionId}`);
  }

  delete(sessionId: string): void {
    this.clear(sessionId);
  }

  /**
   * Vérifie si une session existe toujours (pour la validation)
   */
  exists(sessionId: string): boolean {
    return this.get(sessionId) !== null;
  }

  /**
   * Récupère le nombre de sessions actives (pour le monitoring)
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Nettoie les sessions expirées
   */
  private cleanup(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      Logger.info(`[2FA] Nettoyage: ${cleanedCount} sessions expirées supprimées`);
    }
  }

  /**
   * Démarrer le job de nettoyage automatique
   */
  private startCleanupJob(): void {
    // Nettoyer toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Arrêter le job de nettoyage (pour les tests ou shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.sessions.clear();
  }
}

// Instance singleton (dans une app produit, utiliser un conteneur DI)
export const pendingAuth2FAStore = new PendingAuth2FAStore();
