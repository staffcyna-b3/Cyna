'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const orderItems = await queryInterface.describeTable('order_items');

    if (orderItems.product_name) {
      await queryInterface.removeColumn('order_items', 'product_name');
    }

    if (!orderItems.product_id) {
      await queryInterface.addColumn('order_items', 'product_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      });

      await queryInterface.addIndex('order_items', ['product_id']);
    }
  },

  async down(queryInterface, Sequelize) {
    const orderItems = await queryInterface.describeTable('order_items');

    if (orderItems.product_id) {
      await queryInterface.removeColumn('order_items', 'product_id');
    }

    if (!orderItems.product_name) {
      await queryInterface.addColumn('order_items', 'product_name', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Unknown product',
      });
    }
  },
};
