'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cart_items', 'period', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('cart_items', 'product_name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.addColumn('cart_items', 'unit_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('cart_items', 'period');
    await queryInterface.removeColumn('cart_items', 'product_name');
    await queryInterface.removeColumn('cart_items', 'unit_price');
  },
};
