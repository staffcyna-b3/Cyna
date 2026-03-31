'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'payment_type', {
      type: Sequelize.ENUM('one_time', 'subscription'),
      allowNull: false,
      defaultValue: 'one_time',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'payment_type');
  },
};
