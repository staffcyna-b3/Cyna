'use strict';

const PROMO_SERVICE_ID = '00000000-0000-0000-0000-000000001001';
const PROMO_PRODUCT_ID = '00000000-0000-0000-0000-000000001002';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkDelete('ligne_promotions', {
      promotion_id: [PROMO_SERVICE_ID, PROMO_PRODUCT_ID],
    });
    await queryInterface.bulkDelete('promotions', {
      id: [PROMO_SERVICE_ID, PROMO_PRODUCT_ID],
    });

    await queryInterface.bulkInsert('promotions', [
      {
        id: PROMO_SERVICE_ID,
        code: 'SERVICE10',
        discount_type: 'service',
        discount_value: 10.00,
        active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: PROMO_PRODUCT_ID,
        code: 'PRODUCT20',
        discount_type: 'product',
        discount_value: 20.00,
        active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [services] = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE is_service = 1 LIMIT 2`
    );
    const [physicals] = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE is_service = 0 LIMIT 2`
    );

    const lignes = [];

    for (const product of services) {
      lignes.push({
        id: require('crypto').randomUUID(),
        promotion_id: PROMO_SERVICE_ID,
        product_id: product.id,
      });
    }

    for (const product of physicals) {
      lignes.push({
        id: require('crypto').randomUUID(),
        promotion_id: PROMO_PRODUCT_ID,
        product_id: product.id,
      });
    }

    if (lignes.length > 0) {
      await queryInterface.bulkInsert('ligne_promotions', lignes);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ligne_promotions', {
      promotion_id: [
        '00000000-0000-0000-0000-000000001001',
        '00000000-0000-0000-0000-000000001002',
      ],
    });
    await queryInterface.bulkDelete('promotions', {
      id: [
        '00000000-0000-0000-0000-000000001001',
        '00000000-0000-0000-0000-000000001002',
      ],
    });
  },
};
