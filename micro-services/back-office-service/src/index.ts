import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { initDb } from './models/index'
import { Logger } from './common/logger'

dotenv.config()

const app = express()

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
app.use(express.json())

initDb()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  Logger.info(`Service connecté sur le port ${PORT}`)
})
