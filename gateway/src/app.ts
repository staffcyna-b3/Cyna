import express, { Express } from 'express';
import helmet from 'helmet';
import routes from './routes';
import { corsMiddleware } from './middlewares/cors.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());

  app.use(corsMiddleware);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use(loggingMiddleware);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use('/api', routes);
  app.use('/auth', authRoutes);

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
