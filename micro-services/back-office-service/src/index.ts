import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initDb } from './models/index';
import { Logger } from './common/logger';
import usersRouter from './routes/users.routes';
import ordersRouter from './routes/orders.routes';
import transactionsRouter from './routes/transactions.routes';
import refundsRouter from './routes/refunds.routes';
import subscriptionsAdminRouter from './routes/subscriptions.routes';
import refundRequestsRouter from './routes/refundRequests.routes';
import salesRouter from './routes/sales.routes';
import { errorHandler } from './middleware/errorHandler';
import { requireAdminHeader } from './middlewares/requireAdminHeader';

import productRoutes from './routes/product.routes'
import promotionRoutes from './routes/promotion.routes'
import categoryRoutes from './routes/category.routes'

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.GATEWAY_INTERNAL_URL || 'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.use('/', productRoutes)
app.use('/', promotionRoutes)
app.use('/', categoryRoutes)

app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/transactions', requireAdminHeader, transactionsRouter);
app.use('/refunds', requireAdminHeader, refundsRouter);
app.use('/subscriptions', requireAdminHeader, subscriptionsAdminRouter);
app.use('/refund-requests', requireAdminHeader, refundRequestsRouter);
app.use('/sales', salesRouter);

app.use(errorHandler);

initDb();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  Logger.info(`Back-office service running on port ${PORT}`);
});