import express, { Request, Response, Router } from 'express';
import { IStripeClient } from '../interfaces/IStripeClient';
import { WebhookService } from '../services/webhookService';
import { Logger } from '../common/logger';

// Il ne peut pas passer par GatewayController/axios car :
// Stripe vérifie la signature sur les bytes bruts du body
// axios reconstruirait la requête et casserait la vérification
// Le header stripe-signature n'est pas forwarded par prepareHeaders()
// Le webhook reste donc en http-proxy-middleware dans app.ts.

export function createStripeWebhookRouter(
  stripeClient: IStripeClient,
  webhookService: WebhookService,
  webhookSecret: string
): Router {
  const router = Router();

  router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'];

      if (!signature || Array.isArray(signature)) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_SIGNATURE',
          message: 'Signature Stripe manquante',
        });
      }

      const event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);

      Logger.info('[STRIPE WEBHOOK] Event received', { type: event.type, eventId: event.id });

      await webhookService.handleStripeEvent(event);

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

  return router;
}
