import express, { Request, Response, Router } from 'express';
import { stripe, stripeWebhookSecret } from '../config/stripe.config';
import { PaymentService } from '../services/payment.service';
import { Logger } from '../common/logger';

const router: Router = Router();
const paymentService = new PaymentService();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    if (!stripeWebhookSecret) {
      return res.status(500).json({
        success: false,
        error: 'STRIPE_WEBHOOK_SECRET_MISSING',
        message: 'Webhook secret non configure',
      });
    }

    const signature = req.headers['stripe-signature'];

    if (!signature || Array.isArray(signature)) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SIGNATURE',
        message: 'Signature Stripe manquante',
      });
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);

    await paymentService.handleStripeEvent(event);

    return res.status(200).json({ received: true });
  } catch (error: any) {
    Logger.error('[STRIPE WEBHOOK] Signature verification failed', {
      message: error?.message,
    });

    return res.status(400).json({
      success: false,
      error: 'INVALID_STRIPE_SIGNATURE',
      message: error?.message || 'Signature invalide',
    });
  }
});

export default router;
