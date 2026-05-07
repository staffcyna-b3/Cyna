'use strict';

// Prérequis : la table `users` doit exister (FK user_id -> users.id).
// Cette migration doit être jouée après toutes les migrations qui créent la table users.
//
// Note : cette table est partagée avec le front-office-service (même base MySQL).
// Si la migration front-office a déjà été jouée, celle-ci sera sans effet car
// sequelize-cli ne rejoue pas une migration déjà enregistrée dans SequelizeMeta.
// Chaque développeur doit jouer les migrations dans les deux services.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refund_requests', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      stripe_subscription_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('refund_requests', ['user_id']);
    await queryInterface.addIndex('refund_requests', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refund_requests');
  },
};
