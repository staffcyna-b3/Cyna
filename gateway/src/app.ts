import express, { Express } from 'express';
import helmet from 'helmet';
import routes from './routes';
import { corsMiddleware } from './middlewares/cors.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { createAuthRoutes } from './routes/auth.routes';
import { UserRepository } from './repository/user.repository';
import { AuthRepository } from './repository/auth.repository';
import { MailService } from './services/mail.service';
import { pendingAuth2FAStore } from './stores/pending-auth-2fa.store';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import cookieParser from 'cookie-parser';
import { paymentsApiProxy, paymentsWebhookProxy } from './proxies/payments.proxy';
import { authMiddleware } from './middlewares/auth.middleware';
import { globalLimiter } from './middlewares/rate-limit.middleware';

export const createApp = (): Express => {
  const app = express();

  // Injection manuelle des dépendances (DIP)
  const container = {
    userRepository: new UserRepository(),
    authRepository: new AuthRepository(),
    mailService: new MailService(),
    pendingAuthStore: pendingAuth2FAStore,
  };

  const authService = new AuthService(
    container.userRepository,
    container.mailService,
    container.pendingAuthStore,
    container.authRepository,
  );
  const authController = new AuthController(authService);
  const authRoutes = createAuthRoutes(authController);
  
  app.use(cookieParser())

  app.use(helmet());
  app.use(globalLimiter);

  app.use(corsMiddleware);

  // Both payment proxies are mounted BEFORE express.json() so the request body
  // stream is never consumed by the gateway — it reaches payments-service intact.
  // express.json() parsing after this point only applies to non-proxied routes.
  // Webhook: no auth — Stripe sends requests without Authorization header.
  app.use('/webhooks', paymentsWebhookProxy);

  // Payment API: gateway validates JWT and injects x-user-id / x-user-email headers
  // before proxying. authMiddleware only reads the Authorization header (no body),
  // so it runs safely before express.json().
  app.use('/api/payments', authMiddleware, paymentsApiProxy);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use(loggingMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use('/api', routes);
  app.use('/api/auth', authRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} non trouvée`,
    });
  });

  app.use(errorMiddleware);

  return app;
};
