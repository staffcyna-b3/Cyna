'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE user_roles MODIFY COLUMN role ENUM('admin', 'user', 'commercial') NOT NULL`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE user_roles MODIFY COLUMN role ENUM('admin', 'user', 'moderator') NOT NULL`
    );
  },
};
