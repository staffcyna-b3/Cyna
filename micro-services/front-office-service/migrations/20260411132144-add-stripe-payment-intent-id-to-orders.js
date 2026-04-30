'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'stripe_payment_intent_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      after: 'status',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'stripe_payment_intent_id');
  },
};
