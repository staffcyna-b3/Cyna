import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import ordersRoutes from '../../routes/orders.routes';
import { initDb } from '../../models';
import { sequelize } from '../../config/database';

const CHECKOUT_USER_ID = '00000000-0000-0000-0000-000000009999';
const CHECKOUT_CART_ID = '00000000-0000-0000-0000-000000007001';
const BILLING_ADDRESS_ID = '00000000-0000-0000-0000-000000009001';
const SHIPPING_ADDRESS_ID = '00000000-0000-0000-0000-000000009002';

const TEST_HEADER_USER_ID = CHECKOUT_USER_ID;
const WRONG_TEST_HEADER_USER_ID = '00000000-0000-0000-0000-000000000000';

describe('Orders routes integration', () => {
  const app = express();
  let createdOrderId: string | null = null;
  let expectedTotalAmount = 109.97;

  const ensureCheckoutCartItems = async () => {
    const [existingCartItems] = await sequelize.query(
      `SELECT id FROM cart_items WHERE cart_id = :cartId`,
      {
        replacements: { cartId: CHECKOUT_CART_ID },
      }
    );

    if (Array.isArray(existingCartItems) && existingCartItems.length > 0) {
      return;
    }

    const [products] = await sequelize.query(`SELECT id FROM products ORDER BY created_at ASC LIMIT 2`);
    if (!Array.isArray(products) || products.length < 2) {
      throw new Error('At least 2 products are required to seed checkout cart items for integration tests.');
    }

    const firstProductId = (products[0] as any).id;
    const secondProductId = (products[1] as any).id;

    await sequelize.query(
      `
      INSERT INTO cart_items (id, cart_id, product_id, quantity)
      VALUES
        (UUID(), :cartId, :firstProductId, 1),
        (UUID(), :cartId, :secondProductId, 2)
      `,
      {
        replacements: {
          cartId: CHECKOUT_CART_ID,
          firstProductId,
          secondProductId,
        },
      }
    );
  };

  beforeAll(async () => {
    app.use(express.json());
    app.use('/', ordersRoutes);

    await initDb();

    const [rows] = await sequelize.query(
      `SELECT id FROM carts WHERE id = :cartId AND user_id = :userId LIMIT 1`,
      {
        replacements: {
          cartId: CHECKOUT_CART_ID,
          userId: CHECKOUT_USER_ID,
        },
      }
    );

    // If this fails, run the checkout seeders before executing integration tests.
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('Checkout seeded data not found. Run seeders for user 9999/cart 7001 before integration tests.');
    }

    await ensureCheckoutCartItems();

    const [cartRows] = await sequelize.query(
      `
      SELECT ci.quantity AS quantity, p.price AS price
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = :cartId
      `,
      {
        replacements: { cartId: CHECKOUT_CART_ID },
      }
    );

    if (Array.isArray(cartRows) && cartRows.length > 0) {
      const total = cartRows.reduce((sum, row: any) => {
        const quantity = Number(row.quantity ?? 0);
        const price = Number(row.price ?? 0);
        return sum + quantity * price;
      }, 0);
      expectedTotalAmount = Number(total.toFixed(2));
    }
  });

  afterAll(async () => {
    await sequelize.query(
      `DELETE oi FROM order_items oi INNER JOIN orders o ON oi.order_id = o.id WHERE o.user_id = :userId`,
      { replacements: { userId: CHECKOUT_USER_ID } }
    );
    await sequelize.query(`DELETE FROM orders WHERE user_id = :userId`, {
      replacements: { userId: CHECKOUT_USER_ID },
    });

    await ensureCheckoutCartItems();

    await sequelize.close();
  });

  it('POST /orders returns 201 with pending order and snapshots', async () => {
    const response = await request(app)
      .post('/orders')
      .set('x-user-id', TEST_HEADER_USER_ID)
      .send({
        cartId: CHECKOUT_CART_ID,
        billingAddressId: BILLING_ADDRESS_ID,
        shippingAddressId: SHIPPING_ADDRESS_ID,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    createdOrderId = response.body.id;

    const status = response.body.status ?? response.body.data?.status;
    expect(status).toBe('PENDING');

    const totalAmount = Number(response.body.totalAmount ?? response.body.total_amount);
    expect(totalAmount).toBe(expectedTotalAmount);

    const items = response.body.items ?? response.body.data?.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(2);

    const billingAddress = response.body.billingAddress ?? response.body.billing_address_snapshot;
    const shippingAddress = response.body.shippingAddress ?? response.body.shipping_address_snapshot;
    expect(billingAddress).toBeTruthy();
    expect(shippingAddress).toBeTruthy();

  });

  it('POST /orders returns 401 when x-user-id header is missing', async () => {
    const response = await request(app).post('/orders').send({
      cartId: CHECKOUT_CART_ID,
      billingAddressId: BILLING_ADDRESS_ID,
      shippingAddressId: SHIPPING_ADDRESS_ID,
    });

    expect(response.status).toBe(401);
  });

  it('POST /orders returns 422 when body fields are missing', async () => {
    const response = await request(app).post('/orders').set('x-user-id', TEST_HEADER_USER_ID).send({});

    expect(response.status).toBe(422);
  });

  it('GET /orders/:id returns 200 with order details', async () => {
    expect(createdOrderId).toBeTruthy();

    const response = await request(app)
      .get(`/orders/${createdOrderId}`)
      .set('x-user-id', TEST_HEADER_USER_ID);

    expect(response.status).toBe(200);

    const items = response.body.items ?? response.body.data?.items;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(1);

    const totalAmount = Number(response.body.totalAmount ?? response.body.total_amount);
    expect(totalAmount).toBe(expectedTotalAmount);

    const billingAddress = response.body.billingAddress ?? response.body.billing_address_snapshot;
    const shippingAddress = response.body.shippingAddress ?? response.body.shipping_address_snapshot;
    expect(billingAddress).toBeTruthy();
    expect(shippingAddress).toBeTruthy();
  });

  it('GET /orders/:id returns 403 for wrong user header', async () => {
    expect(createdOrderId).toBeTruthy();

    const response = await request(app)
      .get(`/orders/${createdOrderId}`)
      .set('x-user-id', WRONG_TEST_HEADER_USER_ID);

    expect(response.status).toBe(403);
  });

  it('GET /orders/:id returns 404 for unknown order id', async () => {
    const response = await request(app)
      .get('/orders/non-existent-id')
      .set('x-user-id', TEST_HEADER_USER_ID);

    expect(response.status).toBe(404);
  });

  it('PATCH /orders/:id/status sets order to PAID', async () => {
    expect(createdOrderId).toBeTruthy();

    const response = await request(app)
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'PAID' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ message: 'Order status updated' });
  });

  it('PATCH /orders/:id/status sets order to CANCELLED', async () => {
    expect(createdOrderId).toBeTruthy();

    const response = await request(app)
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'CANCELLED' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ message: 'Order status updated' });
  });

  it('PATCH /orders/:id/status returns 422 for invalid status', async () => {
    expect(createdOrderId).toBeTruthy();

    const response = await request(app)
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'REFUNDED' });

    expect(response.status).toBe(422);
  });

  it('PATCH /orders/:id/status returns 404 for unknown order id', async () => {
    const response = await request(app)
      .patch('/orders/non-existent-id/status')
      .send({ status: 'PAID' });

    expect(response.status).toBe(404);
  });
});
