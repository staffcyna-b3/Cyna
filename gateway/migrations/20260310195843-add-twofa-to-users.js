'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'twofa_code', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'twofa_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'twofa_attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'twofa_code');
    await queryInterface.removeColumn('users', 'twofa_expires_at');
    await queryInterface.removeColumn('users', 'twofa_attempts');
  },
};
