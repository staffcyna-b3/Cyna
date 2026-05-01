// payments-service entry point
import 'dotenv/config';
import express from 'express';
import { stripe, stripeWebhookSecret } from './providers/stripe';
import { createStripeWebhookRouter } from './routes/stripeWebhook';
import { createWebhookService } from './factories/paymentFactory';
import paymentsRouter from './routes/payments';
import subscriptionsRouter from './routes/subscriptions';
import refundsRouter from './routes/refunds';
import { errorMiddleware } from './middlewares/error.middleware';
import { requireAuth } from './middlewares/requireAuth.middleware';

const app = express();
const PORT = process.env.PORT || 3004;

// /webhook uses express.raw() internally (defined in stripeWebhook router)
// It must be mounted BEFORE the global express.json() parser
const webhookService = createWebhookService();
const webhookRouter = createStripeWebhookRouter(stripe, webhookService, stripeWebhookSecret);
app.use('/webhook', webhookRouter);

app.use(express.json());

app.use('/payments', requireAuth, paymentsRouter);
// Routes internes uniquement — non exposées via l'API Gateway (gateway ne proxie que /payments/**)
app.use('/subscriptions', subscriptionsRouter);
app.use('/refunds', refundsRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`payments-service running on port ${PORT}`);
});
