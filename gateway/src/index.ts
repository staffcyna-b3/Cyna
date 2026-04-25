import dotenv from 'dotenv';
import { initDb } from './models/index'
import { Logger } from './common/logger'
import { createApp } from './app';
import routes from './routes';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
  throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
}

initDb()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const app = createApp();

app.use(routes);

app.listen(PORT, () => {
  Logger.info(`API Gateway running on port ${PORT}`);
  Logger.info(`Environment: ${process.env.NODE_ENV}`);
});
