'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'stripe_subscription_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addIndex('subscriptions', ['stripe_subscription_id']);

    await queryInterface.changeColumn('subscriptions', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('subscriptions', ['stripe_subscription_id']);
    await queryInterface.removeColumn('subscriptions', 'stripe_subscription_id');
    await queryInterface.changeColumn('subscriptions', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    });
  },
};
