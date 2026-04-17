// payments-service entry point
import 'dotenv/config';
import express from 'express';
import webhookRouter from './routes/stripeWebhook';
import paymentsRouter from './routes/payments';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 3004;

// /webhook uses express.raw() internally (defined in stripeWebhook router)
// It must be mounted BEFORE the global express.json() parser
app.use('/webhook', webhookRouter);

app.use(express.json());

app.use('/payments', paymentsRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`payments-service running on port ${PORT}`);
});
