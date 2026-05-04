'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'slug', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'slug');
  },
};
