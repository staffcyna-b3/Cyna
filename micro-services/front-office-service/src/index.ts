import dotenv from 'dotenv'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { initDb } from './models/index'
import { Logger } from './common/logger'
import ordersRoutes from './routes/orders.routes'
import subscriptionRoutes from './routes/subscription.routes'
import userSubscriptionRoutes from './routes/userSubscription.routes'
import cartRoutes from './routes/cart.routes'
import addressRoutes from './routes/address.routes'
import supportRoutes from './routes/support.routes'

dotenv.config()

const app = express()

const allowedOrigins = [
  process.env.GATEWAY_INTERNAL_URL || 'http://localhost:3000',
];

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/subscriptions', subscriptionRoutes)
app.use('/my-subscriptions', userSubscriptionRoutes)
app.use('/', ordersRoutes)

app.use('/cart', cartRoutes)
app.use('/addresses', addressRoutes)
app.use('/support', supportRoutes)

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status: number = err.status || err.statusCode || 500;
  const error: string = err.error || err.message || 'INTERNAL_SERVER_ERROR';
  if (status >= 500) Logger.error('Unhandled error', { status, error });
  res.status(status).json({ success: false, error });
});

initDb()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  Logger.info(`Service connecté sur le port ${PORT}`)
})
