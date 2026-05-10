'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('products', 'license_key');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'license_key', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      unique: true,
    });
  },
};
