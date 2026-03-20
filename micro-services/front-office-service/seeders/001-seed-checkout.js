'use strict';

const CHECKOUT_USER_ID = '00000000-0000-0000-0000-000000009999';
const BILLING_ADDRESS_ID = '00000000-0000-0000-0000-000000009001';
const SHIPPING_ADDRESS_ID = '00000000-0000-0000-0000-000000009002';
const CHECKOUT_CART_ID = '00000000-0000-0000-0000-000000007001';
const CART_ITEM_1_ID = '00000000-0000-0000-0000-000000006001';
const CART_ITEM_2_ID = '00000000-0000-0000-0000-000000006002';

const REQUESTED_PRODUCT_ID_1 = '00000000-0000-0000-0000-000000008001';
const REQUESTED_PRODUCT_ID_2 = '00000000-0000-0000-0000-000000008002';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingOrders] = await queryInterface.sequelize.query(
      `SELECT id FROM orders WHERE user_id = :userId`,
      {
        replacements: { userId: CHECKOUT_USER_ID },
      }
    );

    if (existingOrders.length) {
      const orderIds = existingOrders.map((order) => order.id);

      await queryInterface.bulkDelete('order_items', {
        order_id: orderIds,
      });

      await queryInterface.bulkDelete('orders', {
        id: orderIds,
      });
    }

    await queryInterface.bulkDelete('cart_items', { cart_id: CHECKOUT_CART_ID });
    await queryInterface.bulkDelete('carts', { id: CHECKOUT_CART_ID });
    await queryInterface.bulkDelete('addresses', { user_id: CHECKOUT_USER_ID });
    await queryInterface.bulkDelete('users', { id: CHECKOUT_USER_ID });

    // Aucun seeder users n'existe actuellement dans le monorepo,
    // donc on insère explicitement cet utilisateur de test checkout.
    await queryInterface.bulkInsert('users', [
      {
        id: CHECKOUT_USER_ID,
        full_name: 'Blanche Test',
        email: 'blanche.test@dev.local',
        password: '$2b$10$L/JsLplKl0kvXzc3jGIj/.dhy9gn9Gr50TBbOhwqNsZf7E7vOycE2',
        email_verified: false,
        refresh_token: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('addresses', [
      {
        id: BILLING_ADDRESS_ID,
        user_id: CHECKOUT_USER_ID,
        type: 'billing',
        address_line1: '12 Rue du Commerce',
        city: 'Rennes',
        postcode: '35000',
        country: 'France',
        created_at: now,
        updated_at: now,
      },
      {
        id: SHIPPING_ADDRESS_ID,
        user_id: CHECKOUT_USER_ID,
        type: 'shipping',
        address_line1: '5 Avenue de la Livraison',
        city: 'Rennes',
        postcode: '35000',
        country: 'France',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('carts', [
      {
        id: CHECKOUT_CART_ID,
        user_id: CHECKOUT_USER_ID,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [requestedProducts] = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE id IN (:firstId, :secondId)`,
      {
        replacements: {
          firstId: REQUESTED_PRODUCT_ID_1,
          secondId: REQUESTED_PRODUCT_ID_2,
        },
      }
    );

    let productId1 = REQUESTED_PRODUCT_ID_1;
    let productId2 = REQUESTED_PRODUCT_ID_2;

    if (requestedProducts.length < 2) {
      const [fallbackProducts] = await queryInterface.sequelize.query(
        `SELECT id FROM products ORDER BY created_at ASC LIMIT 2`
      );

      if (fallbackProducts.length < 2) {
        throw new Error('Au moins 2 produits doivent exister avant ce seeder checkout');
      }

      productId1 = fallbackProducts[0].id;
      productId2 = fallbackProducts[1].id;
    }

    await queryInterface.bulkInsert('cart_items', [
      {
        id: CART_ITEM_1_ID,
        cart_id: CHECKOUT_CART_ID,
        product_id: productId1,
        quantity: 1,
      },
      {
        id: CART_ITEM_2_ID,
        cart_id: CHECKOUT_CART_ID,
        product_id: productId2,
        quantity: 2,
      },
    ]);
  },

  async down(queryInterface) {
    const [existingOrders] = await queryInterface.sequelize.query(
      `SELECT id FROM orders WHERE user_id = :userId`,
      {
        replacements: { userId: CHECKOUT_USER_ID },
      }
    );

    if (existingOrders.length) {
      const orderIds = existingOrders.map((order) => order.id);

      await queryInterface.bulkDelete('order_items', {
        order_id: orderIds,
      });

      await queryInterface.bulkDelete('orders', {
        id: orderIds,
      });
    }

    await queryInterface.bulkDelete('cart_items', { cart_id: CHECKOUT_CART_ID });
    await queryInterface.bulkDelete('carts', { id: CHECKOUT_CART_ID });
    await queryInterface.bulkDelete('addresses', { user_id: CHECKOUT_USER_ID });
    await queryInterface.bulkDelete('users', { id: CHECKOUT_USER_ID });
  },
};
