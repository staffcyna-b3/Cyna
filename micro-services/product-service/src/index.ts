import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { Logger } from './common/logger'
import { initDb } from './models';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';

dotenv.config();
const app = express()

const allowedOrigins = [
  process.env.GATEWAY_INTERNAL_URL || 'http://localhost:3000',
];

app.use(cors())
app.use(express.json())

initDb()

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, () => {
  Logger.info(`Service connecté sur le port ${PORT}`)
})
