'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'license_key', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'license_key');
  },
};
