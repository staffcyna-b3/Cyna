import rateLimit from 'express-rate-limit';
import { Logger } from '../common/logger';

const getRetryAfterSeconds = (resetTime: Date | undefined, fallbackSeconds: number): number => {
  if (!resetTime) {
    return fallbackSeconds;
  }

  return Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
};

/**
 * Middleware de rate limiting pour la route POST /auth/login
 * 
 * Configuration:
 * - 5 tentatives maximum par IP
 * - Fenêtre de temps: 15 minutes
 * - Réinitialisation automatique après 15 minutes
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Trop de tentatives de connexion. Vérifiez votre email ou réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    return req.method !== 'POST';
  },
  keyGenerator: (req, res) => {
    // Utiliser l'IP du client pour limiter par IP
    return req.ip || 'unknown';
  },
  handler: (req, res) => {
    Logger.warn(
      `[RATE_LIMIT] Login limiter atteint pour IP ${req.ip} à ${new Date().toISOString()}`
    );
    res.status(429).json({
      error: 'TOO_MANY_LOGIN_ATTEMPTS',
      message:
        'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
      retryAfter: getRetryAfterSeconds(req.rateLimit?.resetTime, 900),
    });
  },
});

/**
 * Middleware de rate limiting pour la route POST /auth/verify-2fa
 * 
 * Configuration:
 * - 3 tentatives maximum par sessionId
 * - Fenêtre de temps: 5 minutes
 * - Clé de limitation basée sur le sessionId (et non l'IP uniquement)
 * 
 * Important: Ce limiter utilise le sessionId fourni dans le body
 * pour éviter les attaques par brute force ciblées
 */
export const verify2FALimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: 'Trop de tentatives de vérification 2FA. Demandez un nouveau code.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    return req.method !== 'POST';
  },
  keyGenerator: (req, res) => {
    const sessionId = req.body.session_id || 'unknown';
    const ip = req.ip || 'unknown';
    
    return `${sessionId}:${ip}`;
  },
  handler: (req, res) => {
    const sessionId = req.body.session_id || 'unknown';
    Logger.warn(
      `[RATE_LIMIT] 2FA limiter atteint pour sessionId ${sessionId} à ${new Date().toISOString()}`
    );
    res.status(429).json({
      error: 'TOO_MANY_2FA_ATTEMPTS',
      message:
        'Trop de tentatives de vérification 2FA. Demandez un nouveau code ou reconnectez-vous.',
      retryAfter: getRetryAfterSeconds(req.rateLimit?.resetTime, 300),
    });
  },
});

/**
 * Middleware de rate limiting pour la route POST /auth/register
 * 
 * Configuration:
 * - 10 tentatives maximum par IP
 * - Fenêtre de temps: 1 heure
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: 'Trop de tentatives d\'inscription. Réessayez dans 1 heure.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    return req.method !== 'POST';
  },
  keyGenerator: (req, res) => {
    return req.ip || 'unknown';
  },
  handler: (req, res) => {
    Logger.warn(
      `[RATE_LIMIT] Register limiter atteint pour IP ${req.ip} à ${new Date().toISOString()}`
    );
    res.status(429).json({
      error: 'TOO_MANY_REGISTRATION_ATTEMPTS',
      message:
        'Trop de tentatives d\'inscription. Réessayez dans 1 heure.',
      retryAfter: getRetryAfterSeconds(req.rateLimit?.resetTime, 3600),
    });
  },
});

/**
 * Middleware de rate limiting pour les demandes de reset password
 * 
 * Configuration:
 * - 5 tentatives maximum par IP
 * - Fenêtre de temps: 1 heure
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 tentatives
  message: 'Trop de demandes de reset. Réessayez dans 1 heure.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    return req.method !== 'POST';
  },
  keyGenerator: (req, res) => {
    return req.ip || 'unknown';
  },
  handler: (req, res) => {
    Logger.warn(
      `[RATE_LIMIT] Password reset limiter atteint pour IP ${req.ip} à ${new Date().toISOString()}`
    );
    res.status(429).json({
      error: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS',
      message:
        'Trop de demandes de réinitialisation. Réessayez dans 1 heure.',
      retryAfter: getRetryAfterSeconds(req.rateLimit?.resetTime, 3600),
    });
  },
});
