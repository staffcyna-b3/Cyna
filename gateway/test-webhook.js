/**
 * test-webhook.js
 *
 * Simulates Stripe webhook events locally without the Stripe CLI.
 * Generates valid Stripe signatures using STRIPE_WEBHOOK_SECRET from .env,
 * then POSTs each event to the running gateway.
 *
 * Usage:
 *   node test-webhook.js
 *
 * Prerequisites:
 *   - STRIPE_WEBHOOK_SECRET must be set in gateway/.env
 *   - The gateway must be running on the configured PORT
 */

'use strict';

const fs     = require('fs');
const path   = require('path');
const http   = require('http');
const crypto = require('crypto');

// ─── Load .env ────────────────────────────────────────────────────────────────

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return acc;
      acc[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
      return acc;
    }, {});
}

const env            = loadEnv(path.join(__dirname, '.env'));
const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
const PORT           = parseInt(env.PORT || '3000', 10);
const HOST           = 'localhost';
const WEBHOOK_PATH   = '/webhooks/stripe';

if (!WEBHOOK_SECRET) {
  console.error('\n❌  STRIPE_WEBHOOK_SECRET is not set in gateway/.env');
  console.error('    Run: stripe listen --forward-to localhost:3000/webhooks/stripe');
  console.error('    Then copy the printed whsec_... value into your .env\n');
  process.exit(1);
}

// ─── Stripe signature (mirrors stripe.webhooks.constructEvent verification) ──
//
//  signed_payload = timestamp + "." + raw_body
//  v1             = HMAC-SHA256(webhook_secret, signed_payload)
//  header         = "t=" + timestamp + ",v1=" + v1

function buildStripeSignatureHeader(rawBody, secret) {
  const timestamp   = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${rawBody}`;
  const v1 = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${v1}`;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function postWebhook(payload) {
  return new Promise((resolve, reject) => {
    const body      = JSON.stringify(payload);
    const signature = buildStripeSignatureHeader(body, WEBHOOK_SECRET);

    const options = {
      hostname: HOST,
      port:     PORT,
      path:     WEBHOOK_PATH,
      method:   'POST',
      headers:  {
        'Content-Type':     'application/json',
        'Content-Length':   Buffer.byteLength(body),
        'stripe-signature': signature,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Mock payloads ────────────────────────────────────────────────────────────

const NOW                  = Math.floor(Date.now() / 1000);
// const MOCK_USER_ID         = 'user_test_aabbcc112233'; // unused for email — see MOCK_USER_EMAIL
const MOCK_USER_ID         = 'cc24542d-784f-4588-a65d-6e86b54e3e49';
const MOCK_USER_EMAIL      = process.env.TEST_USER_EMAIL || 'marie.richir35@gmail.com';
const MOCK_CUSTOMER_ID     = 'cus_test_aabbcc112233';
// const MOCK_PAYMENT_INTENT  = 'pi_test_3TGG7e2eZvKYlo2C0000001';
const MOCK_PAYMENT_INTENT  = 'pi_3TLOQi1AdBsYOB9D0XYQK7QA'; // Test avec un PaymentIntent existant dans la base de données
const MOCK_INVOICE_ID      = 'in_test_1NjVin2eZvKYlo2CzGRuJ9A6';
const MOCK_SUBSCRIPTION_ID = 'sub_1TLOK81AdBsYOB9DDkZ1jTxb';
// const MOCK_PRICE_ID        = 'price_test_cynapro_monthly';
const MOCK_PRICE_ID        = '149999';

const EVENTS = [
  // ── 1. payment_intent.succeeded ─────────────────────────────────────────────
  {
    label: 'payment_intent.succeeded',
    description: 'One-time payment confirmed by Stripe',
    payload: {
      id:       'evt_test_001',
      object:   'event',
      type:     'payment_intent.succeeded',
      created:  NOW,
      livemode: false,
      data: {
        object: {
          id:             MOCK_PAYMENT_INTENT,
          object:         'payment_intent',
          amount:         MOCK_PRICE_ID,
          currency:       'eur',
          status:         'succeeded',
          description:    'CYNA — Abonnement Pro (mensuel)',
          metadata:       { userId: MOCK_USER_ID, userEmail: MOCK_USER_EMAIL },
          customer:       MOCK_CUSTOMER_ID,
          payment_method: 'pm_test_card_visa',
          created:        NOW,
        },
      },
    },
  },

  // ── 2. payment_intent.payment_failed ────────────────────────────────────────
  {
    label: 'payment_intent.payment_failed',
    description: 'Card declined — insufficient funds',
    payload: {
      id:       'evt_test_002',
      object:   'event',
      type:     'payment_intent.payment_failed',
      created:  NOW,
      livemode: false,
      data: {
        object: {
          id:          'pi_test_failed_0000002',
          object:      'payment_intent',
          amount:      4999,
          currency:    'eur',
          status:      'requires_payment_method',
          description: 'CYNA — Abonnement Pro (mensuel)',
          metadata:    { userId: MOCK_USER_ID },
          customer:    MOCK_CUSTOMER_ID,
          last_payment_error: {
            code:         'card_declined',
            decline_code: 'insufficient_funds',
            message:      'Your card has insufficient funds.',
            type:         'card_error',
          },
          created: NOW,
        },
      },
    },
  },

  // ── 3. invoice.payment_succeeded ────────────────────────────────────────────
  {
    label: 'invoice.payment_succeeded',
    description: 'Subscription renewal paid successfully',
    payload: {
      id:       'evt_test_003',
      object:   'event',
      type:     'invoice.payment_succeeded',
      created:  NOW,
      livemode: false,
      data: {
        object: {
          id:             MOCK_INVOICE_ID,
          object:         'invoice',
          status:         'paid',
          amount_paid:    4999,
          amount_due:     4999,
          currency:       'eur',
          customer:       MOCK_CUSTOMER_ID,
          payment_intent: MOCK_PAYMENT_INTENT,
          billing_reason: 'subscription_cycle',
          period_start:   NOW - 30 * 24 * 3600,
          period_end:     NOW,
          parent: {
            type:                 'subscription_details',
            subscription_details: { subscription: MOCK_SUBSCRIPTION_ID },
          },
          lines: {
            object: 'list',
            data: [
              {
                id:          'il_test_001',
                object:      'line_item',
                amount:      4999,
                currency:    'eur',
                description: 'CYNA — Abonnement Pro × 1',
                period:      { start: NOW - 30 * 24 * 3600, end: NOW },
                price: {
                  id:        MOCK_PRICE_ID,
                  unit_amount: 4999,
                  currency:  'eur',
                  recurring: { interval: 'month', interval_count: 1 },
                },
              },
            ],
          },
          created: NOW,
        },
      },
    },
  },

  // ── 4. invoice.payment_failed ───────────────────────────────────────────────
  {
    label: 'invoice.payment_failed',
    description: 'Subscription renewal payment failed (attempt 2/4)',
    payload: {
      id:       'evt_test_004',
      object:   'event',
      type:     'invoice.payment_failed',
      created:  NOW,
      livemode: false,
      data: {
        object: {
          id:            'in_test_failed_0000003',
          object:        'invoice',
          status:        'open',
          amount_due:    4999,
          amount_paid:   0,
          currency:      'eur',
          customer:      MOCK_CUSTOMER_ID,
          payment_intent:'pi_test_invoice_failed_0003',
          billing_reason:'subscription_cycle',
          attempt_count: 2,
          next_payment_attempt: NOW + 3 * 24 * 3600,
          parent: {
            type:                 'subscription_details',
            subscription_details: { subscription: MOCK_SUBSCRIPTION_ID },
          },
          created: NOW,
        },
      },
    },
  },

  // ── 5. customer.subscription.deleted ────────────────────────────────────────
  {
    label: 'customer.subscription.deleted',
    description: 'Subscription cancelled (end of period)',
    payload: {
      id:       'evt_test_005',
      object:   'event',
      type:     'customer.subscription.deleted',
      created:  NOW,
      livemode: false,
      data: {
        object: {
          id:                   MOCK_SUBSCRIPTION_ID,
          object:               'subscription',
          status:               'canceled',
          customer:             MOCK_CUSTOMER_ID,
          current_period_start: NOW - 30 * 24 * 3600,
          current_period_end:   NOW,
          canceled_at:          NOW,
          cancel_at_period_end: false,
          metadata:             { userId: MOCK_USER_ID },
          items: {
            object: 'list',
            data: [
              {
                id:     'si_test_001',
                object: 'subscription_item',
                price: {
                  id:           MOCK_PRICE_ID,
                  object:       'price',
                  unit_amount:  4999,
                  currency:     'eur',
                  recurring:    { interval: 'month', interval_count: 1 },
                },
                quantity: 1,
              },
            ],
          },
          created: NOW - 30 * 24 * 3600,
        },
      },
    },
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           CYNA — Stripe Webhook Test Script             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  Target  : http://${HOST}:${PORT}${WEBHOOK_PATH}`);
  console.log(`  Secret  : ${WEBHOOK_SECRET.slice(0, 14)}...`);
  console.log(`  Events  : ${EVENTS.length}\n`);
  console.log('─'.repeat(62));

  let passed = 0;
  let failed = 0;

  for (const event of EVENTS) {
    console.log(`\n▶  ${event.label}`);
    console.log(`   ${event.description}`);

    try {
      const result = await postWebhook(event.payload);
      const ok     = result.status === 200;

      if (ok) {
        console.log(`   ✅  ${result.status}  ${result.body}`);
        passed++;
      } else {
        console.log(`   ❌  ${result.status}  ${result.body}`);
        failed++;
      }
    } catch (err) {
      console.log(`   💥  Connection refused — is the gateway running on port ${PORT}?`);
      console.log(`       ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(62));
  console.log(`\n  Results : ${passed}/${EVENTS.length} passed${failed > 0 ? `, ${failed} failed` : ' ✅'}`);

  if (failed > 0) {
    console.log('\n  Troubleshooting:');
    console.log('  • 500 STRIPE_WEBHOOK_SECRET_MISSING → set STRIPE_WEBHOOK_SECRET in .env');
    console.log('  • 400 INVALID_STRIPE_SIGNATURE      → secret in .env does not match this script');
    console.log('  • Connection refused                → start the gateway first (npm run dev)');
    console.log('');
    console.log('  Note: invoice.* and subscription.* events return 200 { received: true }');
    console.log('  even if not yet handled — this is the correct Stripe behavior (ignored events');
    console.log('  should still be acknowledged with 2xx).\n');
  } else {
    console.log('');
  }
}

run();
