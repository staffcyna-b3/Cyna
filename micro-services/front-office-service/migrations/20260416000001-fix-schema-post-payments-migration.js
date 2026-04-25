'use strict';

/**
 * Regroupe les 3 corrections manuelles appliquées lors de la migration
 * de la logique Stripe vers payments-service (16/04/2026).
 *
 * 1. Suppression de la FK subscriptions.product_id → products.id
 *    (anti-pattern microservices : chaque service gère ses propres données)
 *
 * 2. Ajout de la colonne orders.billing_address_id si absente
 *    (colonne attendue par le modèle Order mais absente de la migration initiale)
 *
 * 3. Migration du ENUM orders.status : pending/success/error → PENDING/PAID/CANCELLED
 *    (alignement entre le code front-office et la définition de la table)
 *
 * Toutes les étapes sont idempotentes : elles vérifient l'état courant avant d'agir.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Suppression FK subscriptions.product_id → products.id ──────────────
    const [fkRows] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'subscriptions'
        AND COLUMN_NAME = 'product_id'
        AND REFERENCED_TABLE_NAME = 'products'
    `);

    if (fkRows.length > 0) {
      await queryInterface.removeConstraint('subscriptions', fkRows[0].CONSTRAINT_NAME);
    }

    // ── 2. Ajout billing_address_id dans orders si absent ────────────────────
    const [billingCol] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'billing_address_id'
    `);

    if (billingCol.length === 0) {
      await queryInterface.addColumn('orders', 'billing_address_id', {
        type: Sequelize.CHAR(36),
        allowNull: true,
      });
    }

    // ── 3. Migration ENUM orders.status ──────────────────────────────────────
    // Vérifier les valeurs actuelles du ENUM
    const [enumRows] = await queryInterface.sequelize.query(`
      SELECT COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'status'
    `);

    const currentType = enumRows[0]?.COLUMN_TYPE || '';
    const alreadyMigrated = currentType.includes('PENDING');

    if (!alreadyMigrated) {
      // Passer par VARCHAR pour éviter le conflit ENUM case-insensitive (pending vs PENDING)
      await queryInterface.sequelize.query(`ALTER TABLE orders MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING'`);
      await queryInterface.sequelize.query(`UPDATE orders SET status = 'PENDING'   WHERE status = 'pending'`);
      await queryInterface.sequelize.query(`UPDATE orders SET status = 'PAID'      WHERE status = 'success'`);
      await queryInterface.sequelize.query(`UPDATE orders SET status = 'CANCELLED' WHERE status = 'error'`);
      await queryInterface.sequelize.query(`ALTER TABLE orders MODIFY COLUMN status ENUM('PENDING','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING'`);
    }
  },

  async down(queryInterface, Sequelize) {
    // ── 3. Rollback ENUM orders.status ────────────────────────────────────────
    const [enumRows] = await queryInterface.sequelize.query(`
      SELECT COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'status'
    `);

    const currentType = enumRows[0]?.COLUMN_TYPE || '';
    if (currentType.includes('PENDING')) {
      await queryInterface.sequelize.query(`
        ALTER TABLE orders MODIFY COLUMN status
        ENUM('PENDING','PAID','CANCELLED','pending','success','error')
        NOT NULL DEFAULT 'PENDING'
      `);
      await queryInterface.sequelize.query(`UPDATE orders SET status = 'pending' WHERE status = 'PENDING'`);
      await queryInterface.sequelize.query(`UPDATE orders SET status = 'success' WHERE status = 'PAID'`);
      await queryInterface.sequelize.query(`UPDATE orders SET status = 'error'   WHERE status = 'CANCELLED'`);
      await queryInterface.sequelize.query(`
        ALTER TABLE orders MODIFY COLUMN status
        ENUM('pending','success','error')
        NOT NULL DEFAULT 'pending'
      `);
    }

    // ── 2. Rollback billing_address_id ────────────────────────────────────────
    const [billingCol] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orders'
        AND COLUMN_NAME = 'billing_address_id'
    `);

    if (billingCol.length > 0) {
      await queryInterface.removeColumn('orders', 'billing_address_id');
    }

    // ── 1. Rollback FK subscriptions.product_id (optionnel / déconseillé) ────
    // Non restauré : cette FK est une erreur d'architecture microservices.
    // La remettre casserait les environments où product-service et front-office
    // n'utilisent pas exactement le même jeu de données.
  },
};
