'use strict';

async function dropForeignKeys(queryInterface, tableName, columnName) {
  const [rows] = await queryInterface.sequelize.query(
    `
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = :tableName
      AND COLUMN_NAME = :columnName
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `,
    {
      replacements: { tableName, columnName },
    }
  );

  for (const row of rows) {
    await queryInterface.removeConstraint(tableName, row.CONSTRAINT_NAME);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const orders = await queryInterface.describeTable('orders');
    const orderItems = await queryInterface.describeTable('order_items');

    if (orders.user_id) {
      await dropForeignKeys(queryInterface, 'orders', 'user_id');
      await queryInterface.changeColumn('orders', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }

    if (!orders.billing_address_id) {
      await queryInterface.addColumn('orders', 'billing_address_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id',
        },
      });
    }

    if (!orders.shipping_address_id) {
      await queryInterface.addColumn('orders', 'shipping_address_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id',
        },
      });
    }

    if (!orders.billing_address_snapshot) {
      await queryInterface.addColumn('orders', 'billing_address_snapshot', {
        type: Sequelize.JSON,
        allowNull: false,
      });
    }

    if (!orders.shipping_address_snapshot) {
      await queryInterface.addColumn('orders', 'shipping_address_snapshot', {
        type: Sequelize.JSON,
        allowNull: false,
      });
    }

    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('PENDING', 'PAID', 'CANCELLED'),
      defaultValue: 'PENDING',
      allowNull: false,
    });

    if (orders.stripe_payment_intent_id) {
      await queryInterface.removeColumn('orders', 'stripe_payment_intent_id');
    }

    if (orderItems.product_id) {
      await dropForeignKeys(queryInterface, 'order_items', 'product_id');
      await queryInterface.removeColumn('order_items', 'product_id');
    }

    if (!orderItems.product_name) {
      await queryInterface.addColumn('order_items', 'product_name', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Unknown product',
      });
    }

    if (orderItems.price && !orderItems.unit_price) {
      await queryInterface.renameColumn('order_items', 'price', 'unit_price');
    }

    const refreshedOrderItems = await queryInterface.describeTable('order_items');
    if (!refreshedOrderItems.unit_price) {
      await queryInterface.addColumn('order_items', 'unit_price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const orders = await queryInterface.describeTable('orders');
    const orderItems = await queryInterface.describeTable('order_items');

    if (orders.billing_address_snapshot) {
      await queryInterface.removeColumn('orders', 'billing_address_snapshot');
    }

    if (orders.shipping_address_snapshot) {
      await queryInterface.removeColumn('orders', 'shipping_address_snapshot');
    }

    if (orders.billing_address_id) {
      await queryInterface.removeColumn('orders', 'billing_address_id');
    }

    if (orders.shipping_address_id) {
      await queryInterface.removeColumn('orders', 'shipping_address_id');
    }

    if (!orders.stripe_payment_intent_id) {
      await queryInterface.addColumn('orders', 'stripe_payment_intent_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('pending', 'success', 'error'),
      defaultValue: 'pending',
      allowNull: false,
    });

    await queryInterface.changeColumn('orders', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    if (orderItems.product_name) {
      await queryInterface.removeColumn('order_items', 'product_name');
    }

    if (orderItems.unit_price && !orderItems.price) {
      await queryInterface.renameColumn('order_items', 'unit_price', 'price');
    }

    const refreshedOrderItems = await queryInterface.describeTable('order_items');
    if (!refreshedOrderItems.product_id) {
      await queryInterface.addColumn('order_items', 'product_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      });
    }
  },
};
