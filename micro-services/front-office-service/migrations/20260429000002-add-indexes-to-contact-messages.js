'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('contact_messages', ['status']);
    await queryInterface.addIndex('contact_messages', ['created_at']);
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('contact_messages', ['status']);
    await queryInterface.removeIndex('contact_messages', ['created_at']);
  },
};
