import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import { initDb } from './models/index'
import { Logger } from './common/logger'
import { createApp } from './app';
import routes from './routes';

dotenv.config();

initDb()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const app = createApp();

app.use(routes);

app.listen(PORT, () => {
  Logger.info(`API Gateway running on port ${PORT}`);
  Logger.info(`Environment: ${process.env.NODE_ENV}`);
});
