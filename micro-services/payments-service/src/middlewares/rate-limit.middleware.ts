import rateLimit from 'express-rate-limit';
import { Logger } from '../common/logger';

const getRetryAfterSeconds = (resetTime: Date | undefined, fallbackSeconds: number): number => {
  if (!resetTime) return fallbackSeconds;
  return Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
};

export const createPaymentIntentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Keyed by userId (injected by gateway) — req.ip would be the gateway's IP
  keyGenerator: (req) => (req.headers['x-user-id'] as string) || req.ip || 'unknown',
  handler: (req, res) => {
    const userId = req.headers['x-user-id'] || 'unknown';
    Logger.warn(`[RATE_LIMIT] Payment intent limiter atteint pour userId ${userId} à ${new Date().toISOString()}`);
    res.status(429).json({
      error: 'TOO_MANY_PAYMENT_ATTEMPTS',
      message: 'Trop de tentatives de paiement. Réessayez dans 1 heure.',
      retryAfter: getRetryAfterSeconds(req.rateLimit?.resetTime, 3600),
    });
  },
});

export const createSubscriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.headers['x-user-id'] as string) || req.ip || 'unknown',
  handler: (req, res) => {
    const userId = req.headers['x-user-id'] || 'unknown';
    Logger.warn(`[RATE_LIMIT] Subscription limiter atteint pour userId ${userId} à ${new Date().toISOString()}`);
    res.status(429).json({
      error: 'TOO_MANY_SUBSCRIPTION_ATTEMPTS',
      message: "Trop de tentatives de création d'abonnement. Réessayez dans 1 heure.",
      retryAfter: getRetryAfterSeconds(req.rateLimit?.resetTime, 3600),
    });
  },
});
