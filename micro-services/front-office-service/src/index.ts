import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { initDb } from './models/index'
import { Logger } from './common/logger'
import ordersRoutes from './routes/orders.routes'
import subscriptionRoutes from './routes/subscription.routes'
import cartRoutes from './routes/cart.routes'

dotenv.config()

const app = express()

const allowedOrigins = [
  process.env.GATEWAY_INTERNAL_URL || 'http://localhost:3000',
];

app.use(cors())
app.use(express.json())

app.use('/subscriptions', subscriptionRoutes)
app.use('/', ordersRoutes)

app.use('/front-office/cart', cartRoutes) // TODO why ?
app.use('/cart', cartRoutes)

initDb()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  Logger.info(`Service connecté sur le port ${PORT}`)
})
