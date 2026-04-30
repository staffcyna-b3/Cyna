'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const orders = await queryInterface.describeTable('orders');

    if (orders.user_id && String(orders.user_id.type).toLowerCase().includes('int')) {
      await queryInterface.changeColumn('orders', 'user_id', {
        type: Sequelize.UUID,
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const orders = await queryInterface.describeTable('orders');

    if (orders.user_id && String(orders.user_id.type).toLowerCase().includes('char')) {
      await queryInterface.changeColumn('orders', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }
  },
};
