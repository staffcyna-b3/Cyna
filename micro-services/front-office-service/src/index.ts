import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { initDb } from './models/index'
import { Logger } from './common/logger'
import subscriptionRoutes from './routes/subscription.routes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/subscriptions', subscriptionRoutes)

initDb()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  Logger.info(`Service connecté sur le port ${PORT}`)
})
