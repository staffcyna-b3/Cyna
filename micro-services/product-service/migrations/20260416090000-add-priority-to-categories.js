'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('categories');

    if (!table.priority) {
      await queryInterface.addColumn('categories', 'priority', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('categories');

    if (table.priority) {
      await queryInterface.removeColumn('categories', 'priority');
    }
  },
};
