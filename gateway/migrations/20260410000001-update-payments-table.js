'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('payments');

    // Rename 'amount' (INT) → 'total_amount' (DECIMAL) to match the Payment model
    if (table.amount && !table.total_amount) {
      await queryInterface.renameColumn('payments', 'amount', 'total_amount');
      await queryInterface.changeColumn('payments', 'total_amount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      });
    }

    // Add payment_type if missing
    if (!table.payment_type) {
      await queryInterface.addColumn('payments', 'payment_type', {
        type: Sequelize.ENUM('one_time', 'subscription'),
        allowNull: false,
        defaultValue: 'one_time',
        after: 'status',
      });
    }

    // Add updated_at if missing (required by Sequelize timestamps)
    if (!table.updated_at) {
      await queryInterface.addColumn('payments', 'updated_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
        after: 'created_at',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('payments');

    if (table.updated_at) {
      await queryInterface.removeColumn('payments', 'updated_at');
    }

    if (table.payment_type) {
      await queryInterface.removeColumn('payments', 'payment_type');
    }

    if (table.total_amount && !table.amount) {
      await queryInterface.renameColumn('payments', 'total_amount', 'amount');
      await queryInterface.changeColumn('payments', 'amount', {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      });
    }
  },
};
