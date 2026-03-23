import express, { Express } from 'express';
import helmet from 'helmet';
import routes from './routes';
import { corsMiddleware } from './middlewares/cors.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { createAuthRoutes } from './routes/auth.routes';
import { UserRepository } from './repository/user.repository';
import { MailService } from './services/mail.service';
import { pendingAuth2FAStore } from './stores/pending-auth-2fa.store';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import cookieParser from 'cookie-parser';
import stripeWebhookRouter from './webhooks/stripe.webhook';

export const createApp = (): Express => {
  const app = express();

  // Injection manuelle des dépendances (DIP)
  const container = {
    userRepository: new UserRepository(),
    mailService: new MailService(),
    pendingAuthStore: pendingAuth2FAStore,
  };

  const authService = new AuthService(
    container.userRepository,
    container.mailService,
    container.pendingAuthStore,
  );
  const authController = new AuthController(authService);
  const authRoutes = createAuthRoutes(authController);
  
  app.use(cookieParser())

  app.use(helmet());

  app.use(corsMiddleware);

  // Stripe signature verification requires the raw request body.
  app.use('/webhooks', stripeWebhookRouter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use(loggingMiddleware);

  app.get('/health', (req, res) => {
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
