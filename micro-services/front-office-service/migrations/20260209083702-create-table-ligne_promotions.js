'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ligne_promotions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      promotion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'promotions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('ligne_promotions', {
      fields: ['product_id', 'promotion_id'],
      type: 'unique',
      name: 'unique_product_promotion',
    });

    await queryInterface.addIndex('ligne_promotions', ['product_id']);
    await queryInterface.addIndex('ligne_promotions', ['promotion_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ligne_promotions');
  },
};
